const express = require('express');
const router = express.Router();
const RankingsController = require('../controllers/rankings');

// Get player rankings
router.get('/players', RankingsController.getPlayerRankings);

// Get club rankings
router.get('/clubs', RankingsController.getClubRankings);

// Get tournament statistics
router.get('/tournaments', RankingsController.getTournamentStats);

module.exports = router;