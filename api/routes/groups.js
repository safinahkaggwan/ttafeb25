const express = require('express');
const router = express.Router();
//const checkAuth = require('../middleware/check-auth');

const groupController = require('../controllers/groups')

router.get('/', groupController.getallgrps);

// router.post('/', checkAuth,  groupController.creategroups);
router.post('/', groupController.creategroups);

// router.get('/:groupId', checkAuth, groupController.getagroup);
router.get('/:groupId', groupController.getagroup);

// router.patch('/:groupId', checkAuth, groupController.updategroup);
router.patch('/:groupId', groupController.updategroup);

// router.delete('/:groupId', checkAuth, groupController.deletegroup);
router.delete('/:groupId', groupController.deletegroup);

module.exports = router; 