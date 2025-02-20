const jwt = require('jsonwebtoken');
const Tournament = require('../models/tournaments');  // Sequelize tournament model

// Get all tournaments
exports.getalltournaments = (req, res, next) => {
    Tournament.findAll({
        attributes: ['tid', 'tname', 'tlocation', 'sdate', 'edate'] 
    }) 
    .then(tournaments => {
        const response = {
            count: tournaments.length,
            tournaments: tournaments.map(tournament => ({
                tid: tournament.tid,
                tname: tournament.tname,
                tlocation: tournament.tlocation,
                sdate: tournament.sdate,
                edate: tournament.edate,
                request: {
                    type: 'GET',
                    url: `https://ttafeb25.onrender.com/tournaments/${tournament.tid}`
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

// add a new tournament
exports.createtournaments = (req, res, next) => {
    Tournament.create({
        tname: req.body.tname,
        tlocation: req.body.tlocation,
        sdate: req.body.sdate,
        edate: req.body.edate,
    })
    .then(result => {
        res.status(201).json({
            message: 'tournament created successfully',
            createdTournament: result
        });
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: err });
    });
};

// Get a tournament by ID
exports.getatournament = (req, res, next) => {
    const tid = req.params.tournamentId;
    Tournament.findByPk(tid, {
        attributes: ['tid', 'tname', 'tlocation', 'sdate', 'edate'] 
    })
    .then(tournament => {
        if (tournament) {
            res.status(200).json(tournament);
        } else {
            res.status(404).json({ message: 'tournaments not found' });
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: err });
    });
};

// Update a tournament by ID
exports.updatetournament = async (req, res, next) => {
    const id = req.params.tournamentId;
    const updateOps = {};

    try {
        // Ensure the request body is an array of valid updates
        if (!Array.isArray(req.body) || req.body.length === 0) {
            return res.status(400).json({ message: "Invalid request body" });
        }

        // Map request body to create the update object
        req.body.forEach(ops => {
            updateOps[ops.propName] = ops.value;
        });

        // Perform update
        const result = await Tournament.update(updateOps, { where: { tid: tid } });

        // Check if the tournament was updated
        if (result[0] === 0) {
            return res.status(404).json({ message: "tournament not found or no changes made" });
        }

        res.status(200).json({ message: "tournament updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err });
    }
};

// Delete a tournament by ID
exports.deletetournament = (req, res, next) => {
    const id = req.params.tournamentId;
    Tournament.destroy({ where: { tid: id } })
    .then(result => {
        if (result) {
            res.status(200).json({ message: 'Tournament deleted' });
        } else {
            res.status(404).json({ message: 'Tournament not found' });
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: err });
    });
};
