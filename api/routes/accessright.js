// routes/accessRightRoutes.js
const express = require('express');
const accessRightController = require('../controllers/accessright');
const authorizeAccessRight = require('../middleware/checkaccess');
const router = express.Router();

router.get('/access-rights', accessRightController.getAllAccessRights);
router.get('/access-rights', authorizeAccessRight('viewAccessRights'), accessRightController.getAllAccessRights);

module.exports = router;
