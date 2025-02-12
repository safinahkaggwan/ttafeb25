const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');  // Middleware to check JWT token

// User controller
const UserController = require('../controllers/uses');

// GET all users (public or with authentication, depending on use case)
router.get('/', UserController.getallusers);

// Sign up a new user (no authentication required)
router.post('/signup', UserController.signupuser);

// User login (no authentication required)
router.post('/login', UserController.userlogin);

// Delete a user (only authenticated users can delete)
// router.delete('/:userId', checkAuth, UserController.deleteuser);
router.delete('/:userId', UserController.deleteuser);

router.patch('/:userId', UserController.updateuser);

router.get('/:userId', UserController.getuserbyid);

module.exports = router;
