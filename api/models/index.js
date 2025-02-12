// models/index.js
const Game = require('./games');
const GamePlayer = require('./gamePlayer');
const Player = require('./player');
const Tournament = require('./tournaments');
const Grp = require('./groups');

// Initialize all associations
const models = {
    Game,
    GamePlayer,
    Player,
    Tournament,
    Grp
};

Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

module.exports = models;