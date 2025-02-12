const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const Role = require('../models/roles');
const AccessRight = require('../models/accessright');
const RoleAccess = require('../models/roleaccess');

exports.getallusers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'useremail', 'username'],
            include: [
                {
                    model: Role,
                    attributes: ['roleId', 'role', 'description'],
                    include: [
                        {
                            model: AccessRight,
                            through: { attributes: [] }, // Exclude join table data
                            attributes: ['accid', 'right', 'description']
                        }
                    ]
                }
            ]
        });

        const response = users.map(user => {
            // Safely access Role and AccessRights
            const role = user.Role;

            return {
                id: user.id,
                username: user.username,
                useremail: user.useremail,
                role: role
                    ? {
                          roleId: role.roleId,
                          name: role.role,
                          description: role.description,
                          accessRights: role.AccessRights.map(accessRight => ({
                              accid: accessRight.accid,
                              right: accessRight.right || 'N/A',
                              description: accessRight.description || 'N/A'
                          }))
                      }
                    : null
            };
        });

        res.status(200).json({ count: response.length, users: response });
    } catch (err) {
        console.error('Error retrieving users:', err);
        res.status(500).json({ error: err.message });
    }
};

// Sign up a new user
exports.signupuser = async (req, res) => {
    const { username, useremail, password, roleId } = req.body;

    try {
        // Check if email already exists
        const existingUser = await User.findOne({ where: { useremail } });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        // Ensure the role exists
        const role = await Role.findByPk(roleId);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 11);

        // Create a new user
        const newUser = await User.create({
            username,
            useremail,
            password: hashedPassword,
            roleId
        });

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser.id,
                username: newUser.username,
                useremail: newUser.useremail,
                roleId: newUser.roleId
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.userlogin = async (req, res) => {
    const { useremail, password } = req.body;

    try {
        // Find user by email and include associated Role and AccessRights
        const user = await User.findOne({
            where: { useremail },
            include: [
                {
                    model: Role,
                    attributes: ['roleId', 'role'],
                    include: [
                        {
                            model: AccessRight,
                            through: { attributes: [] }, // Exclude join table data
                            attributes: ['right']
                        }
                    ]
                }
            ]
        });

        if (!user) {
            return res.status(401).json({ message: 'Auth failed: User not found' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Auth failed: Incorrect password' });
        }

        // Extract access rights from the user's role
        const accessRights = user.Role?.AccessRights.map(accessRight => accessRight.right) || [];

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, useremail: user.useremail, accessRights },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );

        // Respond with success and user data
        res.status(200).json({
            message: 'Auth successful',
            token,
            user: {
                id: user.id,
                useremail: user.useremail,
                role: user.Role?.role || null,
                accessRights
            }
        });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: err.message });
    }
};

// Backend Code for Updating a User
exports.getuserbyid = async (req, res) => {
    const userId = req.params.userId; // Extract user ID from request parameters

    try {
        // Find the user with associated role information
        const user = await User.findByPk(userId, {
            include: [{
                model: Role, // Assuming Role is an associated model
                attributes: ['roleId', 'role'] // Include role ID and role name
            }],
            attributes: ['id', 'username', 'useremail', 'roleId'] // Include required user attributes
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            id: user.id,
            username: user.username,
            useremail: user.useremail,
            roleId: user.roleId,
            roleName: user.Role?.role || 'Role not assigned' // Safely handle the role name
        });
    } catch (err) {
        console.error('Error retrieving user:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateuser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { username, useremail, password, roleId } = req.body;

        // Validate required fields
        const missingFields = [];
        if (!username) missingFields.push('username');
        if (!useremail) missingFields.push('useremail');
        if (!roleId) missingFields.push('roleId');

        if (missingFields.length > 0) {
            return res.status(400).json({ 
                error: 'Missing required fields', 
                missingFields 
            });
        }

        // Find user
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ 
                error: 'User not found' 
            });
        }

        // Validate role
        if (roleId) {
            const role = await Role.findByPk(roleId);
            if (!role) {
                return res.status(404).json({ 
                    error: 'Role not found' 
                });
            }
        }

        // Handle password update
        let hashedPassword = user.password;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 11);
        }

        // Update user
        await user.update({
            username,
            useremail,
            password: hashedPassword,
            roleId
        });

        // Send response
        res.status(200).json({
            message: 'User updated successfully',
            user: {
                id: user.id,
                username: user.username,
                useremail: user.useremail,
                roleId: user.roleId
            }
        });

    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ 
            error: 'Failed to update user',
            details: err.message 
        });
    }
};

// Delete a user
exports.deleteuser = (req, res, next) => {
    const userId = req.params.userId;

    User.destroy({ where: { id: userId } })
        .then(deleted => {
            if (deleted) {
                res.status(200).json({
                    message: 'User deleted successfully',
                    request: {
                        type: 'POST',
                        url: 'http://localhost:5500/users',
                        body: { useremail: 'String', password: 'String' } // Example of new user creation
                    }
                });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        })
        .catch(err => {
            console.error('Error deleting user:', err);
            res.status(500).json({ error: err.message });
        });
};