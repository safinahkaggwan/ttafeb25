const { Sequelize, Op } = require('sequelize');
const db = require('../db');
const { Player, Club, Game, Tournament, GamePlayer } = require('../models');

// Get player rankings

exports.getPlayerRankings = async (req, res) => {
    try {
        const rankings = await Player.findAll({
            attributes: [
                'pid',
                'pfname',
                'psname',
                [db.fn('COUNT', db.col('Games.gmid')), 'gamesPlayed'],
                [db.fn('SUM', db.col('Games->GamePlayer.score')), 'totalScore']
            ],
            include: [{
                model: Game,
                as: 'Games',
                attributes: [],
                through: {
                    attributes: []
                }
            }],
            group: ['Player.pid', 'Player.pfname', 'Player.psname'],
            order: [[db.literal('totalScore'), 'DESC']]
        });

        res.json(rankings);
    } catch (error) {
        console.error('Error getting player rankings:', error);
        res.status(500).json({ error: 'Failed to get player rankings' });
    }
};// Get club rankings

exports.getClubRankings = async (req, res) => {
    try {
        const clubStats = await Club.findAll({
            attributes: [
                'cid',
                'cname',
                [db.fn('COUNT', db.col('Players.pid')), 'totalPlayers'],
                [db.fn('SUM', db.col('Players->Games->GamePlayer.score')), 'totalScore']
            ],
            include: [{
                model: Player,
                as: 'Players',
                attributes: [],
                include: [{
                    model: Game,
                    attributes: [],
                    through: {
                        attributes: []
                    }
                }]
            }],
            group: ['Club.cid', 'Club.cname'],  // Specify the table name
            order: [
                [db.literal('totalScore'), 'DESC']  // Changed to use literal for consistent ordering
            ]
        });

        res.status(200).json({
            count: clubStats.length,
            rankings: clubStats
        });
    } catch (error) {
        console.error('Error getting club rankings:', error);
        res.status(500).json({
            error: 'Failed to fetch club rankings',
            details: error.message
        });
    }
};

// Get tournament statistics
exports.getTournamentStats = async (req, res) => {
    try {
        const tournamentStats = await Tournament.findAll({
            attributes: [
                'tid',
                'tname',
                [db.fn('COUNT', db.col('Games.gmid')), 'totalGames'],
                [db.fn('COUNT', db.col('Games->GamePlayers.id')), 'totalPlayers']
            ],
            include: [{
                model: Game,
                as: 'Games',
                attributes: [],
                include: [{
                    model: GamePlayer,
                    as: 'GamePlayers',  // Added the alias
                    attributes: []
                }]
            }],
            group: ['Tournament.tid', 'Tournament.tname'],  // Specified table name
            order: [
                [db.literal('totalGames'), 'DESC']  // Changed to use literal
            ]
        });

        res.status(200).json({
            count: tournamentStats.length,
            tournaments: tournamentStats
        });
    } catch (error) {
        console.error('Error getting tournament stats:', error);
        res.status(500).json({
            error: 'Failed to fetch tournament statistics',
            details: error.message
        });
    }
};