// const { sequelize } = require('../db');
const db = require('../db'); 
const Game = require('../models/games');
const GamePlayer = require('../models/gamePlayer');
const Player = require('../models/player');
const Grp = require('../models/groups');
const Tournament = require('../models/tournaments');
// const { Op } = require('sequelize');

// Get all games
exports.getAllGames = async (req, res) => {
    try {
        const games = await Game.findAll({
            attributes: [
                'gmid', 
                'gtype', 
                'gmname', 
                'tid', 
                'gid'
            ],
            include: [
                {
                    model: Player,
                    through: {
                        model: GamePlayer,
                        attributes: ['gteam', 'score']
                    },
                    attributes: ['pid', 'pfname', 'psname'],
                    required: false
                },
                {
                    model: Grp,
                    attributes: ['gid', 'gname']
                },
                {
                    model: Tournament,
                    attributes: ['tid', 'tname']
                }
            ]
        });

        const response = {
            count: games.length,
            games: games.map(game => ({
                gmid: game.gmid,
                gtype: game.gtype,
                gmname: game.gmname,
                tid: game.tid,
                gid: game.gid,
                players: game.Players?.map(player => ({
                    pid: player.pid,
                    name: `${player.pfname || ''} ${player.psname || ''}`.trim(),
                    gteam: player.GamePlayer?.gteam || null,
                    score: player.GamePlayer?.score || 0
                })) || []
            }))
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).json({ error: 'Failed to fetch games' });
    }
};

// Create game without players
// exports.createGame = async (req, res) => {
//     const t = await sequelize.transaction();
//     try {
//         const { gtype, gmname, tid, gid } = req.body;

//         // Basic validation
//         if (!gtype || !gmname || !tid || !gid) {
//             await t.rollback();
//             return res.status(400).json({ error: 'All fields are required' });
//         }

//         if (!['singles', 'doubles'].includes(gtype)) {
//             await t.rollback();
//             return res.status(400).json({ error: 'Invalid game type' });
//         }

//         const game = await Game.create({
//             gtype, gmname, tid, gid
//         }, { transaction: t });

//         await t.commit();
//         res.status(201).json({ 
//             message: 'Game created successfully',
//             game 
//         });
//     } catch (error) {
//         await t.rollback();
//         console.error('Error creating game:', error);
//         res.status(500).json({ error: 'Failed to create game' });
//     }
// };


exports.createGame = async (req, res) => {
    let t;
    try {
        t = await db.transaction();
        
        const { gtype, gmname, tid, gid } = req.body;

        // Validation
        if (!gtype || !gmname || !tid || !gid) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (!['singles', 'doubles'].includes(gtype)) {
            return res.status(400).json({ error: 'Invalid game type' });
        }

        const game = await Game.create({
            gtype, 
            gmname, 
            tid, 
            gid
        }, { transaction: t });

        await t.commit();
        res.status(201).json({ 
            message: 'Game created successfully',
            game 
        });
    } catch (error) {
        if (t) await t.rollback();
        console.error('Error creating game:', error);
        res.status(500).json({ error: 'Failed to create game' });
    }
};

// Add players to game
exports.addPlayersToGame = async (req, res) => {
    const t = await db.transaction();
    try {
        const { gmid } = req.params;

        if (!req.body || !req.body.players || !Array.isArray(req.body.players)) {
            return res.status(400).json({ 
                error: 'Invalid request format. Expected players array' 
            });
        }

        const { players } = req.body;

         // Check for empty players array
         if (players.length === 0) {
            return res.status(400).json({ 
                error: 'No players provided' 
            });
        }

        const game = await Game.findByPk(gmid);
        if (!game) {
            await t.rollback();
            return res.status(404).json({ error: 'Game not found' });
        }

        const maxPlayers = game.gtype === 'singles' ? 2 : 4;
        const existingCount = await GamePlayer.count({ where: { gmid } });

        if (existingCount + players.length > maxPlayers) {
            await t.rollback();
            return res.status(400).json({ 
                error: `Maximum ${maxPlayers} players allowed` 
            });
        }

        const addedPlayers = await Promise.all(players.map(player =>
            GamePlayer.create({
                gmid,
                pid: player.pid,
                gteam: player.gteam,
                score: player.score || 0
            }, { transaction: t })
        ));

        await t.commit();
        res.status(200).json({
            message: 'Players added successfully',
            players: addedPlayers
        });
    } catch (error) {
        await t.rollback();
        console.error('Error adding players:', error);
        res.status(500).json({ error: 'Failed to add players' });
    }
};

// Get details of a single game
exports.getGame = async (req, res) => {
    try {
        const { id } = req.params;

        const game = await Game.findOne({
            where: { gmid: id },
            include: [{
                model: GamePlayer,
                include: [Player]
            }]
        });

        if (!game) {
            return res.status(404).json({ error: 'Game not found.' });
        }

        res.status(200).json(game);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch game details.' });
    }
};

// Get game configuration
exports.getGameConfig = async (req, res) => {
    try {
        const { id } = req.params;

        const game = await Game.findOne({
            where: { gmid: id },
            include: [{
                model: GamePlayer,
                include: [Player]
            }]
        });

        if (!game) {
            return res.status(404).json({ error: 'Game not found.' });
        }

        const config = {
            gmid: game.gmid,
            gtype: game.gtype,
            gmname: game.gmname,
            players: game.GamePlayers.map(gp => ({
                pid: gp.Player.pid,
                pname: gp.Player.pname,
                gteam: gp.gteam
            }))
        };

        res.status(200).json(config);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch game configuration.' });
    }
};

// Update scores of players in a game
exports.updateScores = async (req, res) => {
    try {
        const { id } = req.params;
        const { scores } = req.body;

        const gamePlayers = await GamePlayer.findAll({ where: { gmid: id } });

        if (!gamePlayers || gamePlayers.length === 0) {
            return res.status(404).json({ error: 'Game or players not found.' });
        }

        // Update scores for each player
        for (const score of scores) {
            const gamePlayer = gamePlayers.find(gp => gp.pid === score.pid);
            if (gamePlayer) {
                gamePlayer.score = score.score;
                await gamePlayer.save();
            }
        }

        res.status(200).json({ message: 'Scores updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update scores.' });
    }
};

// Delete a game
exports.deleteGame = async (req, res) => {
    try {
        const gameId = req.params.id || req.params.gameId;
        
        console.log('Delete game params:', {
            params: req.params,
            gameId: gameId
        });

        if (!gameId) {
            return res.status(400).json({ 
                error: 'Game ID is required' 
            });
        }

        const game = await Game.findOne({ 
            where: { gmid: gameId },
            logging: console.log
        });

        if (!game) {
            return res.status(404).json({ 
                error: 'Game not found' 
            });
        }

        await game.destroy();
        
        res.status(200).json({ 
            message: 'Game deleted successfully',
            deletedId: gameId 
        });

    } catch (error) {
        console.error('Delete game error:', {
            error: error.message,
            params: req.params
        });
        res.status(500).json({ 
            error: 'Failed to delete game' 
        });
    }
};
// Get rankings for a game
exports.getRankings = async (req, res) => {
    try {
        const { id } = req.params;

        const gamePlayers = await GamePlayer.findAll({
            where: { gmid: id },
            include: [Player]
        });

        if (!gamePlayers || gamePlayers.length === 0) {
            return res.status(404).json({ error: 'No players found for the game.' });
        }

        // Calculate team scores
        const teamScores = {};
        gamePlayers.forEach(gp => {
            if (!teamScores[gp.gteam]) teamScores[gp.gteam] = 0;
            teamScores[gp.gteam] += gp.score;
        });

        const winner = Object.keys(teamScores).reduce((a, b) => teamScores[a] > teamScores[b] ? a : b);

        res.status(200).json({ rankings: teamScores, winner });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get rankings.' });
    }
};
