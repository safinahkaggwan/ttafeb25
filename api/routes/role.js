const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role');

// Route to create a new role with access rights
router.post('/', roleController.createRole);

// Route to assign an access right to a role
router.post('/assign', roleController.assignAccessRight);

// Route to fetch a specific role with its associated access rights
router.get('/:id', roleController.getRoleWithAccessRights);

// Route to fetch all roles with their associated access rights
router.get('/', roleController.getAllRolesWithAccessRights);

router.delete('/:roleId', roleController.deleterole);

router.get('/:roleId', roleController.getRole);

router.put('/:roleId', roleController.updateRole);

module.exports = router;
