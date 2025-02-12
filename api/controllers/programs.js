const jwt = require('jsonwebtoken');
const Program = require('../models/programs');  // Sequelize programs model

// Get all programs
exports.getallprograms = (req, res, next) => {
    Program.findAll({
        attributes: ['prid', 'prname', 'description'] 
    }) 
    .then(programs => {
        const response = {
            count: programs.length,
            programs: programs.map(program => ({
                prid: program.prid,
                prname: program.prname,
                description: program.description,
                request: {
                    type: 'GET',
                    url: `http://localhost:5500/programs/${program.prid}`
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

// add a new program
exports.createprograms = (req, res, next) => {
    Program.create({
        prname: req.body.prname,
        description: req.body.description,
    })
    .then(result => {
        res.status(201).json({
            message: 'program created successfully',
            createdProgram: result
        });
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: err });
    });
};

// Get a program by ID
exports.getaprogram = (req, res, next) => {
    const prid = req.params.programId;
    Program.findByPk(prid, {
        attributes: ['prid', 'prname', 'description'] 
    })
    .then(program => {
        if (program) {
            res.status(200).json(program);
        } else {
            res.status(404).json({ message: 'programs not found' });
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: err });
    });
};

// Update a program by ID
exports.updateprogram = async (req, res, next) => {
    const id = req.params.programId;
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
        const result = await Program.update(updateOps, { where: { prid: prid } });

        // Check if the program was updated
        if (result[0] === 0) {
            return res.status(404).json({ message: "program not found or no changes made" });
        }

        res.status(200).json({ message: "program updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err });
    }
};

// Delete a program by ID
exports.deleteprogram = (req, res, next) => {
    const id = req.params.programId;
    Program.destroy({ where: { prid: id } })
    .then(result => {
        if (result) {
            res.status(200).json({ message: 'Program deleted' });
        } else {
            res.status(404).json({ message: 'Program not found' });
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: err });
    });
};
