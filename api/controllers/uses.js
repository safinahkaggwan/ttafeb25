const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users');  // Sequelize User model

// Get all users
exports.getallusers = (req, res, next) => {
    User.findAll({
        attributes: ['id', 'email', 'username']  // Only fetch these attributes
    })
    .then(users => {
        const response = {
            count: users.length,
            users: users.map(user => ({
                id: user.id,
                name: user.username,
                email: user.email,
                request: {
                    type: 'GET',
                    url: `http://localhost:5500/users/${user.id}`
                }
            }))
        };
        res.status(200).json(response);
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: err.message });
    });
};

// Sign up a new user
exports.signupuser = (req, res, next) => {
    User.findOne({ where: { email: req.body.email } })
    .then(existingUser => {
        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        // Hash the password before storing
        bcrypt.hash(req.body.password, 11, (err, hash) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Create the new user
            User.create({
                username: req.body.username,  // Use username from the request body
                email: req.body.email,
                password: hash,  // Store hashed password
                name: req.body.name  // If you need to store a separate name field
            })
            .then(newUser => {
                res.status(201).json({
                    message: 'User created successfully',
                    user: {
                        id: newUser.id,
                        email: newUser.email,
                        username: newUser.username,
                        name: newUser.name  // Return the name if needed
                    }
                });
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ error: err.message });
            });
        });
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: err.message });
    });
};

// User login
exports.userlogin = (req, res, next) => {
    User.findOne({ where: { email: req.body.email } })
    .then(user => {
        if (!user) {
            return res.status(401).json({ message: 'Auth failed: User not found' });
        }

        // Compare the provided password with the hashed password in the database
        bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(401).json({ message: 'Auth failed: Password error' });
            }

            if (isMatch) {
                // Generate a JWT token
                const token = jwt.sign(
                    { email: user.email, userId: user.id },
                    process.env.JWT_KEY,
                    { expiresIn: '1h' }
                );

                return res.status(200).json({
                    message: 'Auth successful',
                    token: token
                });
            } else {
                return res.status(401).json({ message: 'Incorrect password' });
            }
        });
    })
    .catch(err => {
        console.error('Error during login:', err);
        res.status(500).json({ error: err.message });
    });
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
                    url: 'http://localhost:3000/users',
                    body: { email: 'String', password: 'String' }  // Example of new user creation
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
