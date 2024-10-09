const express = require('express');
const router = express.Router();
const gameController = require('../controllers/games');

// Fetch all games and render them in a view
router.get('/', gameController.games_get_all);

// Create a new game (form view and POST action)
router.get('/create', (req, res) => {
    res.render('games/create');
});
router.post('/', gameController.create_game);

router.get('/:gameId', gameController.getagame);

router.patch('/:gameId', gameController.updategame);

router.delete('/:gameId', gameController.deletegame);

module.exports = router;
