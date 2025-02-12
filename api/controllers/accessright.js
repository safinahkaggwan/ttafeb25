// controllers/accessRightController.js
const AccessRight = require('../models/accessright');

// Get all access rights
exports.getAllAccessRights = async (req, res) => {
    try {
        const accessRights = await AccessRight.findAll({
            attributes: ['accid', 'right', 'description'] 
        });

        res.status(200).json({ accessRights });
    } catch (error) {
        console.error('Error fetching access rights:', error);
        res.status(500).json({ error: error.message });
    }
};
 