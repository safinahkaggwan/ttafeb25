const Roles = require('../models/roles');
const AccessRight = require('../models/accessright');
const RoleAccess = require('../models/roleaccess');
const db = require('../db');

module.exports = {
    // Method to create a role with access rights association
    createRole: async (req, res) => {
        const { role, description, accessRights } = req.body;

        try {
            // Create the new role with the provided name and description
            const newRole = await Roles.create({ role, description });

            // Associate the role with access rights, if any are provided
            if (accessRights && accessRights.length > 0) {
                for (const accid of accessRights) {
                    await RoleAccess.create({ roleId: newRole.roleId, accid });
                }
            }

            res.status(201).json({ message: 'Role created successfully!', role: newRole });
        } catch (error) {
            console.error('Error creating role:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // Method to assign an access right to a specific role
    assignAccessRight: async (req, res) => {
        const { roleId, accessRightId } = req.body;

        try {
            // Ensure the role and access right exist
            const role = await Roles.findByPk(roleId);
            const accessRight = await AccessRight.findByPk(accessRightId);

            if (!role || !accessRight) {
                return res.status(404).json({ message: 'Role or Access Right not found' });
            }

            // Create the association in the RoleAccess table
            await RoleAccess.create({ roleId, accid: accessRightId });

            res.status(200).json({ message: 'Access right assigned to role' });
        } catch (error) {
            console.error('Error assigning access right:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // Method to get a role along with its associated access rights
    getRoleWithAccessRights: async (req, res) => {
        try {
            const { id } = req.params;

            // Fetch the role and associated access rights
            const role = await Roles.findByPk(id, {
                include: {
                    model: AccessRight,
                    through: { attributes: [] }, // Exclude join table data
                    attributes: ['accid', 'right', 'description']
                }
            });

            if (!role) {
                return res.status(404).json({ message: 'Role not found' });
            }

            res.status(200).json(role);
        } catch (error) {
            console.error('Error retrieving role:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // Get all roles with their associated access rights
    getAllRolesWithAccessRights: async (req, res) => {
        try {
            const roles = await Roles.findAll({
                include: {
                    model: AccessRight,
                    through: { attributes: [] }, // Exclude join table data
                    attributes: ['accid', 'right', 'description'] // Only fetch necessary fields
                }
            });

            const response = roles.map(role => ({
                roleId: role.roleId,
                role: role.role,
                description: role.description,
                accessRights: role.AccessRights.map(right => ({
                    accid: right.accid,
                    right: right.right,
                    description: right.description
                }))
            }));

            res.status(200).json({ roles: response });
        } catch (error) {
            console.error('Error fetching roles with access rights:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // Get all roles
    getRoles: async (req, res) => {
        try {
            const roles = await Role.findAll({
                include: [{
                    model: AccessRight,
                    attributes: ['accid', 'right', 'description'],
                    through: { attributes: [] } // Exclude join table attributes
                }]
            });
            res.status(200).json({ roles });
        } catch (error) {
            console.error('Error fetching roles:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // Add this function to the module.exports object

    getRole: async (req, res) => {
        try {
            const { id } = req.params;

            const role = await Role.findByPk(id, {
                include: [{
                    model: AccessRight,
                    attributes: ['accid', 'right', 'description'],
                    through: { attributes: [] }
                }]
            });

            if (!role) {
                return res.status(404).json({
                    success: false,
                    message: 'Role not found'
                });
            }

            return res.status(200).json({
                success: true,
                role: {
                    roleId: role.roleId,
                    role: role.role,
                    description: role.description,
                    accessRights: role.AccessRights.map(right => ({
                        accid: right.accid,
                        right: right.right,
                        description: right.description
                    }))
                }
            });

        } catch (error) {
            console.error('Error fetching role:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Error fetching role'
            });
        }
    },

    updateRole: async (req, res) => {
        let transaction;
        try {
            const { roleId } = req.params;
            const { role, description, accessRights } = req.body;

            // Input validation
            if (!role || !description || !Array.isArray(accessRights)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid input data' 
                });
            }

            transaction = await db.transaction();

            // Update role details
            const [updated] = await Roles.update(
                { role, description },
                { 
                    where: { roleId },
                    transaction 
                }
            );

            if (!updated) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'Role not found'
                });
            }

            // Update access rights
            await RoleAccess.destroy({ 
                where: { roleId }, 
                transaction 
            });

            if (accessRights.length > 0) {
                await RoleAccess.bulkCreate(
                    accessRights.map(accid => ({
                        roleId,
                        accid
                    })),
                    { transaction }
                );
            }

            await transaction.commit();
            return res.status(200).json({
                success: true,
                message: 'Role updated successfully'
            });

        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error('Error updating role:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update role'
            });
        }
    },

    // Delete a role by ID
    deleterole: async (req, res) => {
        let transaction;
        try {
            transaction = await db.transaction();
            
            // Get roleId from params and validate
            const roleId = req.params.roleId;
            
            if (!roleId) {
                return res.status(400).json({
                    success: false,
                    error: 'Role ID is required'
                });
            }

            const roleToDelete = await Roles.findOne({
                where: { 
                    roleId: roleId  // Match model column name
                },
                transaction
            });

            if (!roleToDelete) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    error: 'Role not found'
                });
            }

            await RoleAccess.destroy({
                where: { roleId },
                transaction
            });

            await roleToDelete.destroy({ transaction });
            await transaction.commit();

            return res.status(200).json({
                success: true,
                message: 'Role deleted successfully'
            });

        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error('Delete role error:', {
                message: error.message,
                params: req.params
            });
            return res.status(500).json({
                success: false,
                error: 'Failed to delete role'
            });
        }
    }

};