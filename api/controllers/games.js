const db = require('../db'); 
const { Game, GamePlayer, Player, Tournament, Grp } = require('../models');

// Get all games
exports.getAllGames = async (req, res) => {
    try {
        const games = await Game.findAll({
            attributes: ['gmid', 'gtype', 'gmname', 'tid', 'gid', 'status'],
            include: [
                {
                    model: Player,
                    through: {
                        model: GamePlayer,
                        as: 'GamePlayers',
                        attributes: ['gteam', 'set1Score', 'set2Score', 'set3Score']
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
            ],
            where: req.query.tid ? { tid: req.query.tid } : {}
        });

        const response = {
            count: games.length,
            games: games.map(game => ({
                gmid: game.gmid,
                gtype: game.gtype,
                gmname: game.gmname,
                tid: game.tid,
                status: game.status,
                gid: game.gid,
                players: game.Players?.map(player => ({
                    pid: player.pid,
                    name: `${player.pfname || ''} ${player.psname || ''}`.trim(),
                    gteam: player.GamePlayer?.gteam || null,
                    setScores: {
                        set1: player.GamePlayer?.set1Score || 0,
                        set2: player.GamePlayer?.set2Score || 0,
                        set3: player.GamePlayer?.set3Score || 0
                    },
                    totalScore: (player.GamePlayer?.set1Score || 0) +
                               (player.GamePlayer?.set2Score || 0) +
                               (player.GamePlayer?.set3Score || 0)
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
            gtype, 
            gmname, 
            tid, 
            gid,
            status: 'not started'  // Set default status
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

exports.updateGameDetails = async (req, res) => {
    let t;
    try {
        const { gameId } = req.params;
        const { gtype, gmname, tid, gid } = req.body;

        t = await db.transaction();

        // Find the game and lock it for update
        const game = await Game.findOne({ 
            where: { gmid: gameId },
            transaction: t,
            lock: true
        });

        if (!game) {
            await t.rollback();
            return res.status(404).json({ error: 'Game not found' });
        }

        // Check if game status allows updates
        if (game.status !== 'not started') {
            await t.rollback();
            return res.status(400).json({ 
                error: 'Game details can only be updated when status is "not started"' 
            });
        }

        // Validate game type if it's being updated
        if (gtype && !['singles', 'doubles'].includes(gtype)) {
            await t.rollback();
            return res.status(400).json({ error: 'Invalid game type' });
        }

        // Check if changing from doubles to singles is possible
        if (gtype === 'singles' && game.gtype === 'doubles') {
            const playerCount = await GamePlayer.count({ 
                where: { gmid: gameId },
                transaction: t
            });
            if (playerCount > 2) {
                await t.rollback();
                return res.status(400).json({ 
                    error: 'Cannot change to singles: game has more than 2 players' 
                });
            }
        }

        // Update only provided fields
        const updateData = {};
        if (gtype) updateData.gtype = gtype;
        if (gmname) updateData.gmname = gmname;
        if (tid) updateData.tid = tid;
        if (gid) updateData.gid = gid;

        // Only perform update if there are fields to update
        if (Object.keys(updateData).length > 0) {
            await game.update(updateData, { transaction: t });
        }

        await t.commit();

        // Fetch the updated game with related data
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

        res.status(200).json({
            message: 'Game details updated successfully',
            game: {
                gmid: updatedGame.gmid,
                gtype: updatedGame.gtype,
                gmname: updatedGame.gmname,
                tid: updatedGame.tid,
                gid: updatedGame.gid,
                status: updatedGame.status,
                players: updatedGame.GamePlayers?.map(gp => ({
                    pid: gp.Player.pid,
                    name: `${gp.Player.pfname || ''} ${gp.Player.psname || ''}`.trim(),
                    gteam: gp.gteam
                })) || []
            }
        });

    } catch (error) {
        if (t) await t.rollback();
        console.error('Error updating game details:', error);
        res.status(500).json({ error: 'Failed to update game details' });
    }
};

// Add players to game
exports.addPlayersToGame = async (req, res) => {
    let t;
    try {
        const { gameId } = req.params;
        const gmid = gameId; // For backward compatibility

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
                set1Score: 0,
                set2Score: 0,
                set3Score: 0
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
                attributes: ['pid', 'gteam', 'set1Score', 'set2Score', 'set3Score'],
                include: [{
                    model: Player,
                    attributes: ['pid', 'pfname', 'psname']
                }]
            }]
        });

        if (!game) {
            return res.status(404).json({ error: 'Game not found.' });
        }

        // Transform response to include total scores
        const gameData = game.toJSON();
        gameData.GamePlayers = gameData.GamePlayers.map(gp => ({
            ...gp,
            totalScore: gp.set1Score + gp.set2Score + gp.set3Score
        }));

        res.status(200).json(gameData);
    } catch (error) {
        console.error('Error fetching game:', error);
        res.status(500).json({ error: 'Failed to fetch game details.' });
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

        const game = await Game.findOne({
            where: { gmid: gameId },
            include: [{
                model: GamePlayer,
                include: [Player]
            }]
        });

        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }

        if (game.status === 'not started') {
            return res.status(400).json({ 
                error: 'Rankings not available for games that have not started' 
            });
        }

        const gamePlayers = await GamePlayer.findAll({
            where: { gmid: gameId },
            include: [Player]
        });

        if (!gamePlayers?.length) {
            return res.status(404).json({ error: 'No players found for the game.' });
        }

        const teamScores = {
            A: { set1: 0, set2: 0, set3: 0, total: 0 },
            B: { set1: 0, set2: 0, set3: 0, total: 0 }
        };

        gamePlayers.forEach(gp => {
            if (gp.gteam) {
                teamScores[gp.gteam].set1 += gp.set1Score;
                teamScores[gp.gteam].set2 += gp.set2Score;
                teamScores[gp.gteam].set3 += gp.set3Score;
                teamScores[gp.gteam].total += gp.set1Score + gp.set2Score + gp.set3Score;
            }
        });

        const winner = Object.keys(teamScores).reduce((a, b) => 
            teamScores[a].total > teamScores[b].total ? a : b
        );

        res.status(200).json({ 
            teamScores, 
            winner,
            setWinners: {
                set1: teamScores.A.set1 > teamScores.B.set1 ? 'A' : 'B',
                set2: teamScores.A.set2 > teamScores.B.set2 ? 'A' : 'B',
                set3: teamScores.A.set3 > teamScores.B.set3 ? 'A' : 'B'
            }
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
                setScores: {
                    set1: gamePlayer.set1Score || 0,
                    set2: gamePlayer.set2Score || 0,
                    set3: gamePlayer.set3Score || 0
            },
            totalScore: (gamePlayer.set1Score || 0) + 
                           (gamePlayer.set2Score || 0) + 
                           (gamePlayer.set3Score || 0)
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
            status: game.status,
            teams
        });

    } catch (error) {
        console.error('Error fetching team players:', error);
        res.status(500).json({ error: 'Failed to fetch team players.' });
    }
};

// Get game players in batch for multiple games
exports.getGamePlayersBatch = async (req, res) => {
    try {
        const { gameIds } = req.body;

        if (!gameIds || !Array.isArray(gameIds) || gameIds.length === 0) {
            return res.status(400).json({
                error: 'Invalid request. Please provide an array of game IDs.'
            });
        }

        // Find all game players for the given game IDs
        const gamePlayers = await GamePlayer.findAll({
            where: {
                gmid: gameIds
            },
            include: [{
                model: Player,
                attributes: ['pid', 'pfname', 'psname']
            }]
        });

        // Process results to add player names and total scores
        const processedGamePlayers = gamePlayers.map(gp => {
            const playerName = gp.Player ? `${gp.Player.pfname} ${gp.Player.psname}`.trim() : 'Unknown Player';

            return {
                gmid: gp.gmid,
                pid: gp.pid,
                gteam: gp.gteam,
                set1Score: gp.set1Score || 0,
                set2Score: gp.set2Score || 0,
                set3Score: gp.set3Score || 0,
                totalScore: (gp.set1Score || 0) + (gp.set2Score || 0) + (gp.set3Score || 0),
                name: playerName
            };
        });

        res.status(200).json({
            count: processedGamePlayers.length,
            gamePlayers: processedGamePlayers
        });
    } catch (error) {
        console.error('Error fetching game players batch:', error);
        res.status(500).json({
            error: 'Failed to fetch game players',
            details: error.message
        });
    }
};
// Add new function to update game status
exports.updateGameStatus = async (req, res) => {
    let t;
    try {
        const { gameId } = req.params;
        const { status } = req.body;

        if (!['active', 'completed', 'cancelled', 'not started'].includes(status)) {
            return res.status(400).json({ 
                error: 'Invalid status. Must be active, completed, cancelled, or not started' 
            });
        }

        // Start transaction
        t = await db.transaction();

        // Get the game first
        const game = await Game.findOne({ 
            where: { gmid: gameId },
            transaction: t,
            lock: true
        });

        if (!game) {
            await t.rollback();
            return res.status(404).json({ error: 'Game not found' });
        }

        // Prevent status change to 'active' if not enough players
        if (status === 'active') {
            const playerCount = await GamePlayer.count({ 
                where: { gmid: gameId },
                transaction: t 
            });
            const requiredPlayers = game.gtype === 'singles' ? 2 : 4;

            if (playerCount < requiredPlayers) {
                await t.rollback();
                return res.status(400).json({ 
                    error: `Cannot start game: requires ${requiredPlayers} players` 
                });
            }
        }

        // Only allow status change to 'not started' if no scores are recorded
        if (status === 'not started') {
            const hasScores = await GamePlayer.findOne({
                where: { 
                    gmid: gameId,
                    [db.Sequelize.Op.or]: [
                        { set1Score: { [db.Sequelize.Op.gt]: 0 } },
                        { set2Score: { [db.Sequelize.Op.gt]: 0 } },
                        { set3Score: { [db.Sequelize.Op.gt]: 0 } }
                    ]
                },
                transaction: t
            });

            if (hasScores) {
                await t.rollback();
                return res.status(400).json({ 
                    error: 'Cannot change status to not started after scores have been recorded' 
                });
            }
        }

        await game.update({ status }, { transaction: t });
        await t.commit();

        res.status(200).json({
            message: 'Game status updated successfully',
            gameId,
            status
        });
    } catch (error) {
        if (t) await t.rollback();
        console.error('Error updating game status:', error);
        res.status(500).json({ error: 'Failed to update game status' });
    }
};

// Update game set scores with improved validation and tennis rules
exports.updateSetScores = async (req, res) => {
    let t;
    try {
        const { gameId } = req.params;
        const { setScores } = req.body;

        if (!setScores || !Array.isArray(setScores)) {
            return res.status(400).json({
                error: 'Invalid scores format. Expected an array of set scores.'
            });
        }

        console.log('Received set scores:', JSON.stringify(setScores, null, 2))

        // Start transaction
        t = await db.transaction();

        // Get the game with its players
        const game = await Game.findOne({
            where: { gmid: gameId },
            include: [{
                model: GamePlayer,
                as: 'GamePlayers'
            }],
            transaction: t,
            lock: true
        });

        if (!game) {
            await t.rollback();
            return res.status(404).json({ error: 'Game not found' });
        }

        // Check if game status allows score updates
        if (game.status === 'not started') {
            await t.rollback();
            return res.status(400).json({
                error: 'Cannot update scores for a game that has not started'
            });
        }

        if (game.status === 'completed' || game.status === 'cancelled') {
            await t.rollback();
            return res.status(400).json({
                error: `Cannot update scores for ${game.status} game`
            });
        }

        // Validate all players exist in game
        const playerIds = setScores.map(score => score.pid);
        const validPlayers = game.GamePlayers.filter(gp =>
            playerIds.includes(gp.pid)
        );

        if (validPlayers.length !== playerIds.length) {
            await t.rollback();
            return res.status(400).json({
                error: 'One or more players not found in game'
            });
        }

        // Validate team scores format and required fields
        for (const score of setScores) {
            if (!score.pid || !score.gteam ||
                typeof score.set1 !== 'number' ||
                typeof score.set2 !== 'number' ||
                typeof score.set3 !== 'number') {
                await t.rollback();
                return res.status(400).json({
                    error: 'Invalid score format. Required: pid, gteam, set1, set2, set3'
                });
            }

            // Basic tennis score validation
            if (score.set1 < 0 || score.set2 < 0 || score.set3 < 0) {
                await t.rollback();
                return res.status(400).json({
                    error: 'Scores cannot be negative'
                });
            }

            if (score.set1 > 7 || score.set2 > 7 || score.set3 > 7) {
                await t.rollback();
                return res.status(400).json({
                    error: 'Tennis set scores should not exceed 7 games'
                });
            }
        }

        // Group players by team to validate team scores
        const teamPlayers = {
            A: setScores.filter(s => s.gteam === 'A'),
            B: setScores.filter(s => s.gteam === 'B')
        };

        // Ensure we have players for each team if scores are provided
        if (teamPlayers.A.length === 0 && teamPlayers.B.length > 0) {
            await t.rollback();
            return res.status(400).json({
                error: 'Team A has no players with scores'
            });
        }

        if (teamPlayers.B.length === 0 && teamPlayers.A.length > 0) {
            await t.rollback();
            return res.status(400).json({
                error: 'Team B has no players with scores'
            });
        }

        // Update scores for each player
        await Promise.all(setScores.map(async score => {
            const gamePlayer = game.GamePlayers.find(gp => gp.pid === score.pid);
            console.log(`Updating player ${gamePlayer.pid} scores:`, {
                set1Score: score.set1,
                set2Score: score.set2,
                set3Score: score.set3
            });
            if (gamePlayer) {
                await gamePlayer.update({
                    set1Score: score.set1,
                    set2Score: score.set2,
                    set3Score: score.set3
                }, { transaction: t });
            }
        }));

        // Calculate team totals
        const teamScores = {
            A: { set1: 0, set2: 0, set3: 0, total: 0 },
            B: { set1: 0, set2: 0, set3: 0, total: 0 }
        };

        // Calculate from the updated scores
        setScores.forEach(score => {
            if (score.gteam) {
                teamScores[score.gteam].set1 += score.set1;
                teamScores[score.gteam].set2 += score.set2;
                teamScores[score.gteam].set3 += score.set3;
                teamScores[score.gteam].total += score.set1 + score.set2 + score.set3;
            }
        });

        // Handle potential ties properly
        const setWinners = {
            set1: teamScores.A.set1 > teamScores.B.set1 ? 'A' :
                (teamScores.B.set1 > teamScores.A.set1 ? 'B' : ''),
            set2: teamScores.A.set2 > teamScores.B.set2 ? 'A' :
                (teamScores.B.set2 > teamScores.A.set2 ? 'B' : ''),
            set3: teamScores.A.set3 > teamScores.B.set3 ? 'A' :
                (teamScores.B.set3 > teamScores.A.set3 ? 'B' : '')
        };

        // Count sets won by each team
        const setsWon = {
            A: Object.values(setWinners).filter(winner => winner === 'A').length,
            B: Object.values(setWinners).filter(winner => winner === 'B').length
        };

        // Match is complete if either team has won 2 sets
        const matchComplete = setsWon.A >= 2 || setsWon.B >= 2;

        // Determine overall winner
        const winner = matchComplete ? (setsWon.A > setsWon.B ? 'A' : 'B') : null;

        // If match is complete, automatically update game status
        if (matchComplete && game.status === 'active') {
            await game.update({ status: 'completed' }, { transaction: t });
        }

        await t.commit();

        // Return data in a format that matches what the frontend expects
        res.status(200).json({
            message: matchComplete ?
                `Set scores updated successfully. Match completed with Team ${winner} as winner.` :
                'Set scores updated successfully',
            gameId,
            teamScores,
            setWinners,
            setsWon,
            matchComplete,
            winner
        });
    } catch (error) {
        if (t) await t.rollback();
        console.error('Error updating set scores:', error);
        res.status(500).json({ error: 'Failed to update set scores' });
    }
};

// Get game scores
exports.getGameScores = async (req, res) => {
    try {
        const { gameId } = req.params;

        const game = await Game.findOne({
            where: { gmid: gameId },
            include: [{
                model: GamePlayer,
                as: 'GamePlayers',
                attributes: ['pid', 'gteam', 'set1Score', 'set2Score', 'set3Score'],
                include: [{
                    model: Player,
                    attributes: ['pid', 'pfname', 'psname']
                }]
            }]
        });

        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }

        // Calculate team scores
        const teamScores = {
            A: { set1: 0, set2: 0, set3: 0, total: 0 },
            B: { set1: 0, set2: 0, set3: 0, total: 0 }
        };

        game.GamePlayers.forEach(gamePlayer => {
            if (gamePlayer.gteam) {
                teamScores[gamePlayer.gteam].set1 += gamePlayer.set1Score || 0;
                teamScores[gamePlayer.gteam].set2 += gamePlayer.set2Score || 0;
                teamScores[gamePlayer.gteam].set3 += gamePlayer.set3Score || 0;
                teamScores[gamePlayer.gteam].total +=
                    (gamePlayer.set1Score || 0) +
                    (gamePlayer.set2Score || 0) +
                    (gamePlayer.set3Score || 0);
            }
        });

        // Determine set winners
        const setWinners = {
            set1: teamScores.A.set1 > teamScores.B.set1 ? 'A' : (teamScores.B.set1 > teamScores.A.set1 ? 'B' : ''),
            set2: teamScores.A.set2 > teamScores.B.set2 ? 'A' : (teamScores.B.set2 > teamScores.A.set2 ? 'B' : ''),
            set3: teamScores.A.set3 > teamScores.B.set3 ? 'A' : (teamScores.B.set3 > teamScores.A.set3 ? 'B' : '')
        };

        // Count sets won by each team
        const setsWon = {
            A: (setWinners.set1 === 'A' ? 1 : 0) + (setWinners.set2 === 'A' ? 1 : 0) + (setWinners.set3 === 'A' ? 1 : 0),
            B: (setWinners.set1 === 'B' ? 1 : 0) + (setWinners.set2 === 'B' ? 1 : 0) + (setWinners.set3 === 'B' ? 1 : 0)
        };

        // Determine winner if match is complete
        const matchComplete = setsWon.A >= 2 || setsWon.B >= 2;
        const winner = matchComplete ? (setsWon.A > setsWon.B ? 'A' : 'B') : null;

        res.status(200).json({
            teamScores,
            setWinners,
            setsWon,
            matchComplete,
            winner
        });
    } catch (error) {
        console.error('Error fetching game scores:', error);
        res.status(500).json({ error: 'Failed to fetch game scores' });
    }
};