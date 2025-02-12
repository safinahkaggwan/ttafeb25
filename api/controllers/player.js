const Player = require('../models/player');
const Club = require('../models/clubs');
const Grp = require('../models/groups');
const Game = require('../models/games');
const GamePlayer = require('../models/gamePlayer');
const Tournament = require('../models/tournaments');

// Fetch all players
exports.players_get_all = (req, res, next) => {
    Player.findAll({
        attributes: ['pid', 'pfname', 'psname', 'poname', 'pcontact', 'paltcontact', 'pemail', 'gender', 'dob'],
        include: [
            {
                model: Club,
                attributes: ['cid', 'cname']
            },
            {
                model: Grp,
                attributes: ['gid', 'gname']
            }
        ]
    })
    .then(players => {
        const response = {
            count: players.length,
            players: players.map(player => ({
                pid: player.pid,
                pfname: player.pfname,
                psname: player.psname,
                poname: player.poname,
                pcontact: player.pcontact,
                paltcontact: player.paltcontact,
                pemail: player.pemail,
                gender: player.gender,
                dob: player.dob,
                cname: player.Club ? player.Club.cname : null,
                gname: player.Grp ? player.Grp.gname : null,
                request: {
                    type: 'GET',
                    url: `http://localhost:5500/players/${player.pid}`
                }
            }))
        };
        res.status(200).json(response);
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: err.message });
    });
};

// Create a new player
exports.create_player = (req, res, next) => {
    const { pfname, psname, poname, pcontact, paltcontact, pemail, gender, dob, cid, gid } = req.body;

    // Validate gender
    if (!['male', 'female'].includes(gender)) {
        return res.status(400).json({ message: 'Invalid gender value. Allowed values are "male" or "female".' });
    }

    Player.create({ pfname, psname, poname, pcontact, paltcontact, pemail, gender, dob, cid, gid })
        .then(result => {
            res.status(201).json({
                message: 'Player created successfully',
                createdPlayer: result
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.message });
        });
};

// Fetch a specific player by ID
exports.getaplayer = (req, res, next) => {
    const id = req.params.playerId;
    Player.findByPk(id, {
        attributes: ['pid', 'pfname', 'psname', 'poname', 'pcontact', 'paltcontact', 'pemail', 'gender', 'dob'],
        include: [
            {
                model: Club,
                attributes: ['cid', 'cname']
            },
            {
                model: Grp,
                attributes: ['gid', 'gname']
            }
        ]
    })
    .then(player => {
        if (player) {
            res.status(200).json({
                pid: player.pid,
                pfname: player.pfname,
                psname: player.psname,
                poname: player.poname,
                pcontact: player.pcontact,
                paltcontact: player.paltcontact,
                pemail: player.pemail,
                gender: player.gender,
                dob: player.dob,
                cname: player.Club ? `${player.Club.cid} ${player.Club.cname}` : null,
                gname: player.Grp ? `${player.Grp.gid} ${player.Grp.gname}` : null,
            });
        } else {
            res.status(404).json({ message: 'Player not found' });
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: err.message });
    });
};

// Update a player by ID
exports.updateplayer = async (req, res, next) => {
    const id = req.params.playerId;
    const updateOps = req.body;

    if (updateOps.gender && !['male', 'female'].includes(updateOps.gender)) {
        return res.status(400).json({ message: 'Invalid gender value. Allowed values are "male" or "female".' });
    }

    try {
        const result = await Player.update(updateOps, { where: { pid: id } });

        if (result[0] === 0) {
            return res.status(404).json({ message: 'Player not found or no changes made' });
        }

        res.status(200).json({ message: 'Player updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Delete a player by ID
exports.deleteplayer = (req, res, next) => {
    const id = req.params.playerId;
    Player.destroy({ where: { pid: id } })
    .then(result => {
        if (result) {
            res.status(200).json({ message: 'Player deleted' });
        } else {
            res.status(404).json({ message: 'Player not found' });
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: err.message });
    });
};

exports.getPlayerTournamentStats = async (req, res) => {
    try {
        const { playerId } = req.params;

        const playerGames = await Player.findByPk(playerId, {
            include: [{
                model: Game,
                through: GamePlayer,
                include: [{
                    model: Tournament,
                    attributes: ['tid', 'tname']
                }]
            }]
        });

        if (!playerGames || !playerGames.Games) {
            return res.status(200).json({
                playerId,
                tournaments: []
            });
        }

        const tournamentStats = playerGames.Games.reduce((stats, game) => {
            if (!game.Tournament) return stats;

            const tid = game.Tournament.tid;
            const tname = game.Tournament.tname;

            if (!stats[tid]) {
                stats[tid] = {
                    tournamentName: tname,
                    gamesPlayed: 0,
                    wins: 0,
                    totalScore: 0,
                    games: []
                };
            }

            // Safely access GamePlayer data
            const playerGameData = game.GamePlayer || {};
            const playerTeam = playerGameData.gteam;
            const playerScore = playerGameData.score || 0;

            // Find opponent score more safely
            let opposingScore = 0;
            try {
                const otherPlayers = game.GamePlayers || [];
                const opponent = otherPlayers.find(gp => gp && gp.gteam !== playerTeam);
                opposingScore = opponent ? opponent.score || 0 : 0;
            } catch (error) {
                console.warn('Error finding opponent score:', error);
            }

            stats[tid].gamesPlayed++;
            stats[tid].totalScore += playerScore;
            if (playerScore > opposingScore) {
                stats[tid].wins++;
            }

            stats[tid].games.push({
                gmid: game.gmid,
                gmname: game.gmname || 'Unknown Game',
                gtype: game.gtype || 'Unknown Type',
                team: playerTeam || 'Unknown Team',
                score: playerScore,
                opponentScore: opposingScore,
                won: playerScore > opposingScore
            });

            return stats;
        }, {});

        res.status(200).json({
            playerId,
            tournaments: Object.values(tournamentStats)
        });

    } catch (error) {
        console.error('Error fetching player tournament stats:', error);
        res.status(500).json({ 
            error: 'Failed to fetch player stats',
            details: error.message 
        });
    }
};
