// const Game = require('../models/games');
// const Player = require('../models/player');
// const Group = require('../models/groups'); 
// const Tournament = require('../models/tournaments');

// // Fetch all games
// exports.games_get_all = (req, res, next) => {
//     Game.findAll({
//         attributes: ['lid', 'lname', 'po_score', 'pt_score'],
//         include: [
//             {
//                 model: Player,
//                 as: 'PlayerOne',
//                 attributes: ['pid','pfname', 'psname']
//             },
//             {
//                 model: Player,
//                 as: 'PlayerTwo',
//                 attributes: ['pid','pfname', 'psname']
//             },
//             {
//                 model: Group,
//                 attributes: ['gid','gname']
//             },
//             {
//                 model: Tournament,
//                 attributes: ['tid','tname']  // Fetch only tournament name
//             }
//         ]
//     })
//     .then(games => {
//         const response = {
//             count: games.length,
//             games: games.map(game => ({
//                 lid: game.lid,
//                 lname: game.lname,
//                 po_score: game.po_score,
//                 pt_score: game.pt_score,
//                 playerOne: game.PlayerOne ? `${game.PlayerOne.pid} ${game.PlayerOne.pfname} ${game.PlayerOne.psname}` : null,
//                 playerTwo: game.PlayerTwo ? `${game.PlayerOne.pid} ${game.PlayerTwo.pfname} ${game.PlayerTwo.psname}` : null,
//                 groupName: game.Group ? `${game.Group.gid} ${game.Group.gname}` : null,
//                 tournamentName: game.Tournament ? `${game.Tournament.tid} ${game.Tournament.tname}` : null,
//                 request: {
//                     type: 'GET',
//                     url: `http://localhost:5500/games/${game.lid}`
//                 }
//             }))
//         };
//         res.status(200).json(response);
//     })
//     .catch(err => {
//         console.error(err);
//         res.status(500).json({ error: err.message });
//     });
// };

// // Create a game
// exports.create_game = (req, res, next) => {
//     Game.create({
//         gname: req.body.gname,
//         gid: req.body.gid,
//         poid: req.body.poid,  // Player One ID
//         ptid: req.body.ptid,  // Player Two ID
//         tid: req.body.tid,    // Tournament ID
//         po_score: req.body.po_score,
//         pt_score: req.body.pt_score
//     })
//     .then(result => {
//         res.status(201).json({
//             message: 'Game created successfully',
//             createdGame: result
//         });
//     })
//     .catch(err => {
//         console.error(err);
//         res.status(500).json({ error: err });
//     });
// };

// //get a game
// exports.getagame = (req, res, next) => {
//     const id = req.params.gameId;
//     Game.findByPk(id, {
//         attributes: ['lid', 'lname', 'po_score', 'pt_score'],
//         include: [
//             {
//                 model: Player,
//                 as: 'PlayerOne',
//                 attributes: ['pid','pfname', 'psname']
//             },
//             {
//                 model: Player,
//                 as: 'PlayerTwo',
//                 attributes: ['pid','pfname', 'psname']
//             },
//             {
//                 model: Group,
//                 attributes: ['gid','gname']
//             },
//             {
//                 model: Tournament,
//                 attributes: ['tid','tname']  // Fetch only tournament name
//             }
//         ]
//     })
//     .then(game => {
//         if (game) {
//             res.status(200).json({
//                 lid: game.lid,
//                 lname: game.lname,
//                 po_score: game.po_score,
//                 pt_score: game.pt_score,
//                 playerOne: game.PlayerOne ? `${game.PlayerOne.pid} ${game.PlayerOne.pfname} ${game.PlayerOne.psname}` : null,
//                 playerTwo: game.PlayerTwo ? `${game.PlayerOne.pid} ${game.PlayerTwo.pfname} ${game.PlayerTwo.psname}` : null,
//                 groupName: game.Group ? `${game.Group.gid} ${game.Group.gname}`: null,
//                 tournamentName: game.Tournament ? `${game.Tournament.tid} ${game.Tournament.tname}`: null,
//             });
//         } else {
//             res.status(404).json({ message: 'Game not found' });
//         }
//     })
//     .catch(err => {
//         console.error(err);
//         res.status(500).json({ error: err });
//     });
// };

// // Update a Game by ID
// exports.updategame = async (req, res, next) => {
//     const id = req.params.gameId;
//     const updateOps = {};

//     try {
//         // Ensure the request body is an array of valid updates
//         if (!Array.isArray(req.body) || req.body.length === 0) {
//             return res.status(400).json({ message: "Invalid request body" });
//         }

//         // Map request body to create the update object
//         req.body.forEach(ops => {
//             updateOps[ops.propName] = ops.value;
//         });

//         // Perform update
//         const result = await Game.update(updateOps, { where: { id: lid } });

//         // Check if the game was updated
//         if (result[0] === 0) {
//             return res.status(404).json({ message: "Game not found or no changes made" });
//         }

//         res.status(200).json({ message: "Game updated successfully" });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: err });
//     }
// };

// //delete a game
// exports.deletegame = (req, res, next) => {
//     const id = req.params.gameId;
//     Game.destroy({ where: { id: lid } })
//     .then(result => {
//         if (result) {
//             res.status(200).json({ message: 'Game deleted' });
//         } else {
//             res.status(404).json({ message: 'Game not found' });
//         }
//     })
//     .catch(err => {
//         console.error(err);
//         res.status(500).json({ error: err });
//     });
// };