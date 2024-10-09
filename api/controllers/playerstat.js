const PlayerStat = require('../models/player_stat');
const Player = require('../models/player');
const Tournament = require('../models/tournaments');

// Fetch all player stats
exports.playerstats_get_all = (req, res, next) => {
    PlayerStat.findAll({
        attributes: ['stat_id', 'wins', 'losses'],
        include: [
            {
                model: Player,
                attributes: ['pfname', 'psname']
            },
            {
                model: Tournament,
                attributes: ['tname']
            }
        ]
    })
    .then(stats => {
        const response = {
            count: stats.length,
            playerStats: stats.map(stat => ({
                stat_id: stat.stat_id,
                wins: stat.wins,
                losses: stat.losses,
                playerName: stat.Player ? `${stat.Player.pfname} ${stat.Player.psname}` : null,
                tournamentName: stat.Tournament ? stat.Tournament.tname : null,
                request: {
                    type: 'GET',
                    url: `http://localhost:5500/playerstats/${stat.stat_id}`
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

// Create player stats
exports.create_playerstat = (req, res, next) => {
    PlayerStat.create({
        pid: req.body.pid,  // Player ID
        tid: req.body.tid,  // Tournament ID
        wins: req.body.wins || 0,
        losses: req.body.losses || 0
    })
    .then(result => {
        res.status(201).json({
            message: 'Player stats created successfully',
            createdPlayerStat: result
        });
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: err });
    });
};

//get a playerstat
exports.getaplayerstat = (req, res, next) => {
    const id = req.params.stat_id;
    Player.findByPk(id, {
        attributes: ['stat_id', 'wins', 'losses'],
        include: [
            {
                model: Player,
                attributes: ['pfname', 'psname']
            },
            {
                model: Tournament,
                attributes: ['tname']
            }
        ]
    })
    .then(stat => {
        if (stat) {
            res.status(200).json({
                stat_id: stat.stat_id,
                wins: stat.wins,
                losses: stat.losses,
                playerName: stat.Player ? `${stat.Player.pfname} ${stat.Player.psname}` : null,
                tournamentName: stat.Tournament ? stat.Tournament.tname : null,
            });
        } else {
            res.status(404).json({ message: 'Playerstat not found' });
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: err });
    });
};