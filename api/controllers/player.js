const Player = require('../models/player');
const Club = require('../models/clubs');
const Group = require('../models/groups');

exports.players_get_all = (req, res, next) => {
    Player.findAll({
        attributes: ['pid', 'pfname', 'psname', 'poname', 'pcontact', 'paltcontact', 'pemail', 'gender', 'dob'],
        include: [
            {
                model: Club,
                attributes: ['cid','cname']  // Fetch only the club name
            },
            {
                model: Group,
                attributes: ['gid','gname']  // Fetch only the group name
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
                cname: player.Club ? `${player.Club.cid} ${player.Club.cname}` : null,  // Use the club name if available
                gname: player.Group ? `${player.Group.gid} ${player.Group.gname}` : null,  // Use the group name if available
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

//create player
exports.create_player = (req, res, next) => {
    Player.create({
        pfname: req.body.pfname,
        psname: req.body.psname,
        poname: req.body.poname,
        pcontact: req.body.pcontact,
        paltcontact: req.body.paltcontact,
        pemail: req.body.pemail,
        gender: req.body.gender,
        dob: req.body.dob,
        cid: req.body.cid,  // Club ID
        gid: req.body.gid,  // Group ID
    })
    .then(result => {
        res.status(201).json({
            message: 'Player created successfully',
            createdPlayer: result
        });
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: err });
    });
};

//get a player
exports.getaplayer = (req, res, next) => {
    const id = req.params.playerId;
    Player.findByPk(id, {
        attributes: ['pid', 'pfname', 'psname', 'poname', 'pcontact', 'paltcontact', 'pemail', 'gender', 'dob'],
        include: [
            {
                model: Club,
                attributes: ['cid','cname']
            },
            {
                model: Group,
                attributes: ['gid','gname']
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
                cname: player.Club ? `${player.Club.cid} ${player.Club.cname}` : null,  // Use the club name if available
                gname: player.Group ? `${player.Group.gid} ${player.Group.gname}` : null,
            });
        } else {
            res.status(404).json({ message: 'Player not found' });
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: err });
    });
};

// Update a PLayer by ID
exports.updateplayer = async (req, res, next) => {
    const id = req.params.playerId;
    //const updateOps = {};
    const updateOps = req.body; // assuming body contains key-value pairs

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
        const result = await Player.update(updateOps, { where: { pid: id } });

        // Check if the player was updated
        if (result[0] === 0) {
            return res.status(404).json({ message: "Player not found or no changes made" });
        }

        res.status(200).json({ message: "Player updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err });
    }
};

//delete a player
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
        res.status(500).json({ error: err });
    });
};