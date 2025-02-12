const express = require('express');
const router = express.Router();
//const checkAuth = require('../middleware/check-auth');

const playerController = require('../controllers/player')

router.get('/', playerController.players_get_all);

// router.post('/', checkAuth,  playerController.create_player);
router.post('/', playerController.create_player);

// router.get('/:playerId', checkAuth, playerController.getaplayer);
router.get('/:playerId', playerController.getaplayer);

router.get('/:playerId/tournament-stats', playerController.getPlayerTournamentStats);

// router.patch('/:playerId', checkAuth, playerController.updateplayer);
router.put('/:playerId', playerController.updateplayer);

// router.delete('/:playerId', checkAuth, playerController.deleteplayer);
router.delete('/:playerId', playerController.deleteplayer);

module.exports = router; 