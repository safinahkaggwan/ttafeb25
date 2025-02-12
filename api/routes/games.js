const express = require('express');
const router = express.Router();
const gameController = require('../controllers/games');

// Fetch all games and render them in a view
router.get('/', gameController.getAllGames);

// Create a new game (POST action)
router.post('/', gameController.createGame);

router.post('/:gmid/players', gameController.addPlayersToGame);

// Get a specific game by ID, including players and scores
router.get('/:gameId', gameController.getGame);

// Get game configuration (e.g., players, teams) for a specific game
router.get('/:gameId/config', gameController.getGameConfig);

// Update scores and winner for a game
router.patch('/:gameId/scores', gameController.updateScores);

// Delete a game by ID
router.delete('/:gameId', gameController.deleteGame);

module.exports = router;