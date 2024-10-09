const express = require('express');
const router = express.Router();
const multer = require('multer');
//const checkAuth = require('../middleware/check-auth'); // Assuming you have authentication middleware
const clubController = require('../controllers/clubs');

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');  // Ensure this folder exists
    },
    filename: function(req, file, cb) {
        const date = new Date().toISOString().replace(/:/g, '-');
        cb(null, date + '-' + file.originalname);  // Safe file name
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function(req, file, cb) {
        const fileTypes = /jpeg|jpg|png|gif/;
        const extname = fileTypes.test(file.originalname.toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'), false);
        }
    },
    limits: { fileSize: 1024 * 1024 * 3 } // 3 MB file size limit
});

// Routes

// Get all clubs
router.get('/', clubController.getallclubs);

// Add a new club
router.post('/', upload.single('clubImage'), clubController.createclubs);

// Get a single club by ID
router.get('/:clubId', clubController.getaclub);

// Update a club by ID
router.patch('/:clubId', clubController.updateclub);

// Delete a club by ID
router.delete('/:clubId', clubController.deleteclub);

module.exports = router;
