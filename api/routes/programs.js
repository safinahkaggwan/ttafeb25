const express = require('express');
const router = express.Router();
//const checkAuth = require('../middleware/check-auth');

const programController = require('../controllers/programs')

router.get('/', programController.getallprograms);

// router.post('/', checkAuth, programController.createprograms);
router.post('/',programController.createprograms);

// router.get('/:programId', checkAuth,programController.getaprogram);
router.get('/:programId',programController.getaprogram);

// router.patch('/:programId', checkAuth,programController.updateprogram);
router.patch('/:programId',programController.updateprogram);

// router.delete('/:programId', checkAuth,programController.deleteprogram);
router.delete('/:programId',programController.deleteprogram);

module.exports = router; 