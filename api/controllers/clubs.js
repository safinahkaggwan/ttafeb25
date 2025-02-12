const Club = require('../models/clubs'); // Correct the model path

// Get all clubs
exports.getallclubs = (req, res, next) => {
    Club.findAll({
        attributes: ['cid', 'cname', 'ccontact', 'cemail', 'onboarddate', 'slogan', 'logo'] // Ensure attributes match the model
    })
    .then(clubs => {
        const response = {
            count: clubs.length,
            clubs: clubs.map(club => ({
                id: club.cid,
                cname: club.cname,
                ccontact: club.ccontact,
                cemail: club.cemail,
                onboarddate: club.onboarddate,
                slogan: club.slogan,
                logo: club.logo ? `http://localhost:5500/uploads/${club.logo}` : null, // Include full path for images
                request: {
                    type: 'GET',
                    url: `http://localhost:5500/clubs/${club.cid}` // Ensure proper usage of the ID
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

// Add a new club
exports.createclubs = (req, res, next) => {
    console.log(req.file);
    Club.create({
        cname: req.body.cname,
        ccontact: req.body.ccontact,
        cemail: req.body.cemail,
        onboarddate: req.body.onboarddate,
        slogan: req.body.slogan,
        logo: req.file.path // Assuming you are storing image paths and not BLOBs
    })
    .then(result => {
        res.status(201).json({
            message: 'Club created successfully',
            createdClub: result
        });
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: err.message });
    });
};

// Get a club by ID
exports.getaclub = (req, res, next) => {
    const id = req.params.clubId;
    Club.findByPk(id, {
        attributes: ['cid', 'cname', 'ccontact', 'cemail', 'onboarddate', 'slogan', 'logo'] // Ensure attributes match the model
    })
    .then(club => {
        if (club) {
            res.status(200).json(club);
        } else {
            res.status(404).json({ message: 'Club not found' });
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: err });
    });
};

// Update a club by ID
exports.updateclub = async (req, res, next) => {
    const id = req.params.clubId;
    const updateOps = {};

    try {
        // Expect req.body to be an object, not an array
        for (const propName in req.body) {
            updateOps[propName] = req.body[propName];
        }

        // Perform update using the correct field name
        const result = await Club.update(updateOps, { where: { cid: id } });

        if (result[0] === 0) {
            return res.status(404).json({ message: "Club not found or no changes made" });
        }

        res.status(200).json({ message: "Club updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err });
    }
};

// Delete a club by ID
exports.deleteclub = (req, res, next) => {
    const id = req.params.clubId;
    Club.destroy({ where: { cid: id } }) // Use cid instead of id
    .then(result => {
        if (result) {
            res.status(200).json({ message: 'Club deleted' });
        } else {
            res.status(404).json({ message: 'Club not found' });
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: err });
    });
};
