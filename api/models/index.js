// models/index.js
const Game = require('./games');
const GamePlayer = require('./gamePlayer');
const Player = require('./player');
const Tournament = require('./tournaments');
const Grp = require('./groups');
const Club = require('./clubs');

// Define all associations
Player.belongsToMany(Game, {
    through: GamePlayer,
    foreignKey: 'pid',
    otherKey: 'gmid'
});

Game.belongsToMany(Player, {
    through: GamePlayer,
    foreignKey: 'gmid',
    otherKey: 'pid'
});

// Game.hasMany(GamePlayer, {
//     foreignKey: 'gmid',
//     as: 'GamePlayers',
//     onDelete: 'CASCADE'
// });

GamePlayer.belongsTo(Game, {
    foreignKey: 'gmid'
});

GamePlayer.belongsTo(Player, {
    foreignKey: 'pid'
});

Game.belongsTo(Tournament, {
    foreignKey: 'tid',
    onDelete: 'CASCADE'
});

Game.belongsTo(Grp, {
    foreignKey: 'gid',
    onDelete: 'NO ACTION'
});

Tournament.hasMany(Game, {
    foreignKey: 'tid',
    as: 'Games'
});

Club.hasMany(Player, {
    foreignKey: 'cid',
    as: 'Players'
});

Player.belongsTo(Club, {
    foreignKey: 'cid'
});

// Create models object
const models = {
    Game,
    GamePlayer,
    Player,
    Tournament,
    Grp,
    Club
};

// Initialize any additional model-specific associations
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

module.exports = models;