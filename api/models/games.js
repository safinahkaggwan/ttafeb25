const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Grp = require('./groups');
const Player = require('./player');
const Tournament = require('./tournaments');
const GamePlayer = require('./gamePlayer');

// Define the Game model
const Game = sequelize.define(
  'Game',
  {
    gmid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    gtype: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['singles', 'doubles']], // Validate value
      },
    },
    gmname: {
      type: DataTypes.STRING(35),
      allowNull: false,
    }
  },
  {
    timestamps: false,
    tableName: 'games',
  }
);

Game.belongsToMany(Player, {
  through: GamePlayer,
  foreignKey: 'gmid',
  otherKey: 'pid'
});

Player.belongsToMany(Game, {
  through: GamePlayer,
  foreignKey: 'pid',
  otherKey: 'gmid'
});

// Associations
Game.belongsTo(Tournament, { foreignKey: 'tid', onDelete: 'CASCADE' });
Game.belongsTo(Grp, { foreignKey: 'gid', onDelete: 'NO ACTION' });

// Sync the model
Game.sync({ alter: true })
.then(() => {
    console.log('Game table has been created or updated.');
});

module.exports = Game;
