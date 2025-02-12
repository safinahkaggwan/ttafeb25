const express = require('express');
const router = express.Router();
//const checkAuth = require('../middleware/check-auth');

const tournamentController = require('../controllers/tournament')

router.get('/', tournamentController.getalltournaments);

// router.post('/', checkAuth,  tournamentController.createtournaments);
router.post('/', tournamentController.createtournaments);

// router.get('/:tournamentId', checkAuth, tournamentController.getatournament);
router.get('/:tournamentId', tournamentController.getatournament);

// router.patch('/:tournamentId', checkAuth, tournamentController.updatetournament);
router.patch('/:tournamentId', tournamentController.updatetournament);

// router.delete('/:tournamentId', checkAuth, tournamentController.deletetournament);
router.delete('/:tournamentId', tournamentController.deletetournament);

module.exports = router; 