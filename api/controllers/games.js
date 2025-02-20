const db = require('../db'); 
const { Game, GamePlayer, Player, Tournament, Grp } = require('../models');

// Get all games
exports.getAllGames = async (req, res) => {
    try {
        const games = await Game.findAll({
            attributes: ['gmid', 'gtype', 'gmname', 'tid', 'gid'],
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

// Create game
exports.createGame = async (req, res) => {
    let t;
    try {
        t = await db.transaction();
        
        const { gtype, gmname, tid, gid } = req.body;

        if (!gtype || !gmname || !tid || !gid) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (!['singles', 'doubles'].includes(gtype)) {
            return res.status(400).json({ error: 'Invalid game type' });
        }

        const game = await Game.create({
            gtype, gmname, tid, gid
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
    let t;
    try {
        const { gmid } = req.params;

        if (!req.body?.players?.length) {
            return res.status(400).json({ 
                error: 'Invalid request format or no players provided' 
            });
        }

        const game = await Game.findByPk(gmid);
        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }

        const maxPlayers = game.gtype === 'singles' ? 2 : 4;
        const existingCount = await GamePlayer.count({ where: { gmid } });

        if (existingCount + req.body.players.length > maxPlayers) {
            return res.status(400).json({ 
                error: `Maximum ${maxPlayers} players allowed` 
            });
        }

        t = await db.transaction();

        const addedPlayers = await Promise.all(req.body.players.map(player =>
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
        if (t) await t.rollback();
        console.error('Error adding players:', error);
        res.status(500).json({ error: 'Failed to add players' });
    }
};

// Get details of a single game
exports.getGame = async (req, res) => {
    try {
        const { gameId } = req.params;

        const game = await Game.findOne({
            where: { gmid: gameId },
            include: [{
                model: GamePlayer,
                as: 'GamePlayers',
                include: [{
                    model: Player,
                    attributes: ['pid', 'pfname', 'psname']
                }]
            }]
        });

        if (!game) {
            return res.status(404).json({ error: 'Game not found.' });
        }

        res.status(200).json(game);
    } catch (error) {
        console.error('Error fetching game:', error);
        res.status(500).json({ error: 'Failed to fetch game details.' });
    }
};

exports.getGameConfig = async (req, res) => {
    try {
        const { gameId } = req.params;

        const game = await Game.findOne({
            where: { gmid: gameId },
            include: [{
                model: GamePlayer,
                as: 'GamePlayers',
                include: [{
                    model: Player,
                    attributes: ['pid', 'pfname', 'psname']
                }]
            }]
        });

        if (!game) {
            return res.status(404).json({ error: 'Game not found.' });
        }

        const config = {
            gmid: game.gmid,
            gtype: game.gtype,
            gmname: game.gmname,
            players: game.GamePlayers?.map(gp => ({
                pid: gp.Player.pid,
                name: `${gp.Player.pfname || ''} ${gp.Player.psname || ''}`.trim(),
                gteam: gp.gteam
            })) || []
        };

        res.status(200).json(config);
    } catch (error) {
        console.error('Error fetching game configuration:', error);
        res.status(500).json({ error: 'Failed to fetch game configuration.' });
    }
};

// Update scores of players in a game
exports.updateScores = async (req, res) => {
    let t;
    try {
        const { gameId } = req.params;
        const { scores } = req.body;

        if (!scores || !Array.isArray(scores)) {
            return res.status(400).json({ 
                error: 'Invalid scores format. Expected an array of scores.' 
            });
        }

        t = await db.transaction();

        const gamePlayers = await GamePlayer.findAll({ 
            where: { gmid: gameId },
            transaction: t
        });

        if (!gamePlayers?.length) {
            await t.rollback();
            return res.status(404).json({ error: 'Game or players not found.' });
        }

        await Promise.all(scores.map(async score => {
            const gamePlayer = gamePlayers.find(gp => gp.pid === score.pid);
            if (gamePlayer) {
                await gamePlayer.update({ score: score.score }, { transaction: t });
            }
        }));

        await t.commit();
        res.status(200).json({ 
            message: 'Scores updated successfully',
            updatedGameId: gameId
        });
    } catch (error) {
        if (t) await t.rollback();
        console.error('Error updating scores:', error);
        res.status(500).json({ error: 'Failed to update scores.' });
    }
};

// Delete a game
exports.deleteGame = async (req, res) => {
    let t;
    try {
        const { gameId } = req.params;
        
        if (!gameId) {
            return res.status(400).json({ error: 'Game ID is required' });
        }

        t = await db.transaction();

        const game = await Game.findOne({ 
            where: { gmid: gameId },
            transaction: t
        });

        if (!game) {
            await t.rollback();
            return res.status(404).json({ error: 'Game not found' });
        }

        await game.destroy({ transaction: t });
        await t.commit();
        
        res.status(200).json({ 
            message: 'Game deleted successfully',
            deletedId: gameId 
        });
    } catch (error) {
        if (t) await t.rollback();
        console.error('Delete game error:', {
            error: error.message,
            params: req.params
        });
        res.status(500).json({ error: 'Failed to delete game' });
    }
};

// Get rankings for a game
exports.getRankings = async (req, res) => {
    try {
        const { gameId } = req.params;

        const gamePlayers = await GamePlayer.findAll({
            where: { gmid: gameId },
            include: [Player]
        });

        if (!gamePlayers?.length) {
            return res.status(404).json({ error: 'No players found for the game.' });
        }

        const teamScores = {};
        gamePlayers.forEach(gp => {
            if (!teamScores[gp.gteam]) teamScores[gp.gteam] = 0;
            teamScores[gp.gteam] += gp.score;
        });

        const winner = Object.keys(teamScores).reduce((a, b) => 
            teamScores[a] > teamScores[b] ? a : b
        );

        res.status(200).json({ 
            rankings: teamScores, 
            winner 
        });
    } catch (error) {
        console.error('Error getting rankings:', error);
        res.status(500).json({ error: 'Failed to get rankings.' });
    }
};

exports.getTeamPlayers = async (req, res) => {
    try {
        const { gameId } = req.params;

        const game = await Game.findOne({
            where: { gmid: gameId },
            include: [{
                model: GamePlayer,
                as: 'GamePlayers',  // Add this alias
                include: [{
                    model: Player,
                    attributes: ['pid', 'pfname', 'psname']
                }]
            }]
        });

        if (!game) {
            return res.status(404).json({ error: 'Game not found.' });
        }

        // Organize players by team
        const teams = {
            A: [],
            B: []
        };

        game.GamePlayers.forEach(gamePlayer => {
            const player = {
                pid: gamePlayer.Player.pid,
                name: `${gamePlayer.Player.pfname || ''} ${gamePlayer.Player.psname || ''}`.trim(),
                score: gamePlayer.score
            };

            if (gamePlayer.gteam === 'A') {
                teams.A.push(player);
            } else if (gamePlayer.gteam === 'B') {
                teams.B.push(player);
            }
        });

        res.status(200).json({
            gmid: game.gmid,
            gtype: game.gtype,
            gmname: game.gmname,
            teams
        });

    } catch (error) {
        console.error('Error fetching team players:', error);
        res.status(500).json({ error: 'Failed to fetch team players.' });
    }
};

exports.updateSetScores = async (req, res) => {
    let t;
    try {
        const { gameId } = req.params;
        const { teamScores } = req.body;  // Changed from setScores to teamScores

        if (!teamScores || !teamScores.A || !teamScores.B) {
            return res.status(400).json({ 
                error: 'Invalid scores format. Expected team scores for both teams A and B.' 
            });
        }

        t = await db.transaction();

        const gamePlayers = await GamePlayer.findAll({ 
            where: { gmid: gameId },
            transaction: t
        });

        if (!gamePlayers?.length) {
            await t.rollback();
            return res.status(404).json({ error: 'Game or players not found.' });
        }

        // Update scores for all players in each team
        await Promise.all(gamePlayers.map(async gamePlayer => {
            const teamScore = teamScores[gamePlayer.gteam];
            if (teamScore) {
                const totalScore = (teamScore.set1 || 0) + (teamScore.set2 || 0) + (teamScore.set3 || 0);
                await gamePlayer.update({ 
                    set1Score: teamScore.set1 || 0,
                    set2Score: teamScore.set2 || 0,
                    set3Score: teamScore.set3 || 0,
                    score: totalScore
                }, { transaction: t });
            }
        }));

        await t.commit();

        // Fetch updated game data
        const updatedGame = await Game.findOne({
            where: { gmid: gameId },
            include: [{
                model: GamePlayer,
                as: 'GamePlayers',
                include: [{
                    model: Player,
                    attributes: ['pid', 'pfname', 'psname']
                }]
            }]
        });

        const teams = {
            A: { set1: teamScores.A.set1, set2: teamScores.A.set2, set3: teamScores.A.set3, 
                 total: teamScores.A.set1 + teamScores.A.set2 + teamScores.A.set3 },
            B: { set1: teamScores.B.set1, set2: teamScores.B.set2, set3: teamScores.B.set3,
                 total: teamScores.B.set1 + teamScores.B.set2 + teamScores.B.set3 }
        };

        res.status(200).json({ 
            message: 'Set scores updated successfully',
            updatedGameId: gameId,
            teams,
            players: updatedGame.GamePlayers.map(gp => ({
                pid: gp.Player.pid,
                name: `${gp.Player.pfname || ''} ${gp.Player.psname || ''}`.trim(),
                team: gp.gteam,
                scores: {
                    set1: gp.set1Score,
                    set2: gp.set2Score,
                    set3: gp.set3Score,
                    total: gp.score
                }
            }))
        });
    } catch (error) {
        if (t) await t.rollback();
        console.error('Error updating set scores:', error);
        res.status(500).json({ error: 'Failed to update set scores.' });
    }
};