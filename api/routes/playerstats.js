const express = require('express');
const router = express.Router();
const playerStatsController = require('../controllers/playerstat');

// Fetch all player stats and render them in a view
router.get('/', playerStatsController.playerstats_get_all);

// Create new player stats (form view and POST action)
router.get('/create', (req, res) => {
    res.render('player_stats/create');
});
router.post('/', playerStatsController.create_playerstat);


router.get('/:stat_id', playerStatsController.getaplayerstat);

// router.patch('/:stat_id', playerStatsController.updaterankings);

// router.delete('/:stat_id', playerStatsController.deleteranking);

module.exports = router;
