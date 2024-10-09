const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankings');

// Fetch all rankings and render them in a view
router.get('/', rankingController.rankings_get_all);

// Create a new ranking (form view and POST action)
router.get('/create', (req, res) => {
    res.render('rankings/create'); 
});
router.post('/', rankingController.create_ranking);

router.get('/:rankingId', rankingController.getarank);

router.patch('/:rankingId', rankingController.updaterankings);

router.delete('/:rankingId', rankingController.deleteranking);

module.exports = router;
