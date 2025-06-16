const express = require('express');
const router = express.Router();
const gameController = require('../controllers/games');

// Fetch all games and render them in a view
router.get('/', gameController.getAllGames);

// Create a new game (POST action)
router.post('/', gameController.createGame);

router.post('/:gameId/players', gameController.addPlayersToGame);

// Get a specific game by ID, including players and scores
router.get('/:gameId', gameController.getGame);


// Delete a game by ID
router.delete('/:gameId', gameController.deleteGame);

// team player
router.get('/:gameId/teams', gameController.getTeamPlayers);

router.put('/:gameId', gameController.updateGameDetails);

// Add this new route for status updates
router.put('/:gameId/status', gameController.updateGameStatus);

// Add route for getting game players by batch
router.post('/batch', gameController.getGamePlayersBatch);

// Add route for updating set scores
router.put('/:gameId/scores', gameController.updateSetScores);

// Get game scores
router.get('/:gameId/scores', gameController.getGameScores);

module.exports = router;
