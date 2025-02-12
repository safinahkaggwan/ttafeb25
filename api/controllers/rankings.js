const Player = require('../models/player');
const Club = require('../models/clubs');
const Game = require('../models/games');
const Tournament = require('../models/tournaments');
const GamePlayer = require('../models/gamePlayer');
const { sequelize } = require('../db');
const { Op } = require('sequelize');

// Get player rankings
exports.getPlayerRankings = async (req, res) => {
    try {
        const playerStats = await Player.findAll({
            attributes: [
                'pid',
                'pfname',
                'psname',
                [sequelize.fn('COUNT', sequelize.col('Games.gmid')), 'gamesPlayed'],
                [
                    sequelize.fn('SUM', 
                    sequelize.literal('CASE WHEN GamePlayer.score > otherPlayer.score THEN 1 ELSE 0 END')), 
                    'wins'
                ],
                [sequelize.fn('SUM', sequelize.col('GamePlayer.score')), 'totalScore']
            ],
            include: [{
                model: Game,
                through: GamePlayer,
                attributes: []
            }],
            group: ['Player.pid'],
            order: [
                [sequelize.literal('wins'), 'DESC'],
                [sequelize.literal('totalScore'), 'DESC']
            ]
        });

        res.status(200).json({
            count: playerStats.length,
            rankings: playerStats
        });
    } catch (error) {
        console.error('Error getting player rankings:', error);
        res.status(500).json({ error: 'Failed to fetch rankings' });
    }
};

// Get club rankings
exports.getClubRankings = async (req, res) => {
    try {
        const clubStats = await Club.findAll({
            attributes: [
                'cid',
                'cname',
                [sequelize.fn('COUNT', sequelize.col('Players.pid')), 'totalPlayers'],
                [
                    sequelize.fn('SUM', 
                    sequelize.literal('CASE WHEN GamePlayer.score > otherPlayer.score THEN 1 ELSE 0 END')), 
                    'totalWins'
                ]
            ],
            include: [{
                model: Player,
                attributes: [],
                include: [{
                    model: Game,
                    through: GamePlayer,
                    attributes: []
                }]
            }],
            group: ['Club.cid'],
            order: [
                [sequelize.literal('totalWins'), 'DESC']
            ]
        });

        res.status(200).json({
            count: clubStats.length,
            rankings: clubStats
        });
    } catch (error) {
        console.error('Error getting club rankings:', error);
        res.status(500).json({ error: 'Failed to fetch club rankings' });
    }
};

// Get tournament statistics
exports.getTournamentStats = async (req, res) => {
    try {
        const tournamentStats = await Tournament.findAll({
            attributes: [
                'tid',
                'tname',
                [sequelize.fn('COUNT', sequelize.col('Games.gmid')), 'totalGames'],
                [sequelize.fn('COUNT', sequelize.col('Games->GamePlayer.id')), 'totalParticipants']
            ],
            include: [{
                model: Game,
                attributes: [],
                include: [{
                    model: GamePlayer,
                    attributes: []
                }]
            }],
            group: ['Tournament.tid'],
            order: [
                [sequelize.literal('totalParticipants'), 'DESC']
            ]
        });

        res.status(200).json({
            count: tournamentStats.length,
            tournaments: tournamentStats
        });
    } catch (error) {
        console.error('Error getting tournament stats:', error);
        res.status(500).json({ error: 'Failed to fetch tournament statistics' });
    }
};