const jwt = require('jsonwebtoken');
const Grp = require('../models/groups');  // Sequelize Group model

// Get all groups
exports.getallgrps = (req, res, next) => {
    Grp.findAll({
        attributes: ['gid', 'gname', 'desc'] 
    })
    .then(grps => {
        const response = {
            count: grps.length,
            grps: grps.map(grp => ({
                gid: grp.gid,
                gname: grp.gname,
                desc: grp.desc,
                request: {
                    type: 'GET',
                    url: `http://localhost:5500/groups/${grp.gid}`
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

// add a new grp
exports.creategroups = (req, res, next) => {
    Grp.create({
        gname: req.body.gname,
        desc: req.body.desc,
    })
    .then(result => {
        res.status(201).json({
            message: 'Group created successfully',
            createdGroup: result
        });
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: err });
    });
};

// Get a group by ID
exports.getagroup = (req, res, next) => {
    const id = req.params.grpId;
    Grp.findByPk(id, {
        attributes: ['gid', 'gname', 'desc']
    })
    .then(grp => {
        if (grp) {
            res.status(200).json(grp);
        } else {
            res.status(404).json({ message: 'Group not found' });
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: err });
    });
};

// Update a group by ID
exports.updategroup = async (req, res, next) => {
    const id = req.params.grpId;
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
        const result = await Grp.update(updateOps, { where: { gid: id } });

        // Check if the group was updated
        if (result[0] === 0) {
            return res.status(404).json({ message: "Group not found or no changes made" });
        }

        res.status(200).json({ message: "Group updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err });
    }
};

exports.deletegroup = (req, res) => {
    const id = req.params.groupId; // Match route parameter name

    // Validate ID
    if (!id) {
        return res.status(400).json({ 
            error: 'Group ID is required' 
        });
    }

    console.log('Delete group attempt:', { id });

    Grp.destroy({ 
        where: { 
            gid: id // Match database column name
        }
    })
    .then(result => {
        if (result) {
            res.status(200).json({ message: 'Group deleted' });
        } else {
            res.status(404).json({ message: 'Group not found' });
        }
    })
    .catch(err => {
        console.error('Delete group error:', err);
        res.status(500).json({ 
            error: 'Failed to delete group',
            details: err.message 
        });
    });
};
