// const Ranking = require('../models/rankings');
// const Player = require('../models/player');
// const Group = require('../models/groups');
// const Game = require('../models/games');
// const Tournament = require('../models/tournaments');

// // Fetch all rankings
// exports.rankings_get_all = (req, res, next) => {
//     Ranking.findAll({
//         attributes: ['rid', 'scpoints'],
//         include: [
//             {
//                 model: Player,
//                 attributes: ['pid','pfname', 'psname']
//             },
//             {
//                 model: Game,
//                 attributes: ['lid','lname']
//             },
//             {
//                 model: Group,
//                 attributes: ['gid','name']
//             },
//             {
//                 model: Tournament,
//                 attributes: ['tid','tname']  // Fetch only tournament name
//             }
//         ]
//     })
//     .then(rankings => {
//         const response = {
//             count: rankings.length,
//             rankings: rankings.map(ranking => ({
//                 rid: ranking.rid,
//                 lid: ranking.lid,
//                 scpoints: ranking.scpoints,
//                 playerName: ranking.Player ? `${ranking.Player.pid} ${ranking.Player.pfname} ${ranking.Player.psname}` : null,
//                 groupName: ranking.Group ? `${ranking.Group.gid} ${ranking.Group.name}` : null,
//                 gameName: ranking.Game ? `${ranking.Game.lid} ${ranking.Game.lname}` : null,
//                 tournamentName: ranking.Tournament ? `${ranking.Tournament.tid} ${ranking.Tournament.tname}` : null,
//                 request: {
//                     type: 'GET',
//                     url: `http://localhost:5500/rankings/${ranking.rid}`
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

// // Create a ranking
// exports.create_ranking = (req, res, next) => {
//     Ranking.create({
//         tid: req.body.tid,
//         gid: req.body.gid,
//         lid: req.body.lid,  // Game ID
//         pid: req.body.pid,  // Player ID
//         scpoints: req.body.scpoints
//     })
//     .then(result => {
//         res.status(201).json({
//             message: 'Ranking created successfully',
//             createdRanking: result
//         });
//     })
//     .catch(err => {
//         console.error(err);
//         res.status(500).json({ error: err });
//     });
// };

// //get a rank
// exports.getarank = (req, res, next) => {
//     const id = req.params.rankingId;
//     Ranking.findByPk(id, {
//         attributes: ['rid', 'scpoints'],
//         include: [
//             {
//                 model: Player,
//                 attributes: ['pid','pfname', 'psname']
//             },
//             {
//                 model: Game,
//                 attributes: ['lid','lname']
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
//     .then(ranking => {
//         if (ranking) {
//             res.status(200).json({
//                 rid: ranking.rid,
//                 lid: ranking.lid,
//                 scpoints: ranking.scpoints,
//                 playerName: ranking.Player ? `${ranking.Player.pid} ${ranking.Player.pfname} ${ranking.Player.psname}` : null,
//                 groupName: ranking.Group ? `${ranking.Group.gid} ${ranking.Group.gname}` : null,
//                 gameName: ranking.Game ? `${ranking.Game.lid} ${ranking.Game.lname}` : null,
//                 tournamentName: ranking.Tournament ? `${ranking.Tournament.tid} ${ranking.Tournament.tname}` : null
//             });
//         } else {
//             res.status(404).json({ message: 'Ranking not found' });
//         }
//     })
//     .catch(err => {
//         console.error(err);
//         res.status(500).json({ error: err });
//     });
// };

// // Update a Ranking by ID
// exports.updaterankings = async (req, res, next) => {
//     const id = req.params.rankingId;
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
//         const result = await Ranking.update(updateOps, { where: { id: rid } });

//         // Check if the ranking was updated
//         if (result[0] === 0) {
//             return res.status(404).json({ message: "Ranking not found or no changes made" });
//         }

//         res.status(200).json({ message: "Ranking updated successfully" });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: err });
//     }
// };

// //delete a ranking
// exports.deleteranking = (req, res, next) => {
//     const id = req.params.rankingId;
//     Ranking.destroy({ where: { id: rid } })
//     .then(result => {
//         if (result) {
//             res.status(200).json({ message: 'Ranking deleted' });
//         } else {
//             res.status(404).json({ message: 'Ranking not found' });
//         }
//     })
//     .catch(err => {
//         console.error(err);
//         res.status(500).json({ error: err });
//     });
// };
