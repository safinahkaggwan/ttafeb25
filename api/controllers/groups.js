const jwt = require('jsonwebtoken');
const Group = require('../models/groups');  // Sequelize Group model

// Get all groups
exports.getallgroups = (req, res, next) => {
    Group.findAll({
        attributes: ['gid', 'gname', 'desc'] 
    })
    .then(groups => {
        const response = {
            count: groups.length,
            groups: groups.map(group => ({
                gid: group.gid,
                gname: group.gname,
                desc: group.desc,
                request: {
                    type: 'GET',
                    url: `http://localhost:5500/groups/${group.gid}`
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

// add a new group
exports.creategroups = (req, res, next) => {
    Group.create({
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
    const id = req.params.groupId;
    Group.findByPk(id, {
        attributes: ['gid', 'gname', 'desc']
    })
    .then(group => {
        if (group) {
            res.status(200).json(group);
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
    const id = req.params.groupId;
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
        const result = await Group.update(updateOps, { where: { gid: id } });

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

// Delete a group by ID
exports.deletegroup = (req, res, next) => {
    const id = req.params.groupId;
    Group.destroy({ where: { gid: id } })
    .then(result => {
        if (result) {
            res.status(200).json({ message: 'Group deleted' });
        } else {
            res.status(404).json({ message: 'Group not found' });
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: err });
    });
};
