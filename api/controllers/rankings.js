const { Sequelize, Op } = require('sequelize');
                const db = require('../db');
                const { Player, Club, Game, Tournament, GamePlayer } = require('../models');

// Fix for Player Rankings
exports.getPlayerRankings = async (req, res) => {
    try {
        const rankings = await Player.findAll({
            attributes: [
                'pid',
                'pfname',
                'psname',
                [db.fn('COUNT', db.col('Games.gmid')), 'gamesPlayed'],
                [db.literal('SUM([Games->GamePlayer].[set1Score] + [Games->GamePlayer].[set2Score] + [Games->GamePlayer].[set3Score])'), 'totalScore']
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
};

// Fix for Club Rankings
exports.getClubRankings = async (req, res) => {
    try {
        const clubStats = await Club.findAll({
            attributes: [
                'cid',
                'cname',
                [db.fn('COUNT', db.col('Players.pid')), 'totalPlayers'],
                [db.literal('SUM([Players->Games->GamePlayer].[set1Score] + [Players->Games->GamePlayer].[set2Score] + [Players->Games->GamePlayer].[set3Score])'), 'totalScore']
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
            group: ['Club.cid', 'Club.cname'],
            order: [[db.literal('totalScore'), 'DESC']]
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
                                    as: 'GamePlayers',
                                    attributes: []
                                }]
                            }],
                            group: ['Tournament.tid', 'Tournament.tname'],
                            order: [[db.literal('totalGames'), 'DESC']]
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