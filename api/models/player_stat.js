const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Player = require('./player');
const Tournament = require('./tournaments');

const PlayerStat = sequelize.define('PlayerStat', {
  stat_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  wins: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  losses: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  }
}, {
  timestamps: false,
  tableName: 'player_stats'
});

// Associations
PlayerStat.belongsTo(Player, { foreignKey: 'pid', onDelete: 'CASCADE' });
PlayerStat.belongsTo(Tournament, { foreignKey: 'tid', onDelete: 'CASCADE' });

PlayerStat.sync({ alter: true })
.then(() => {
    console.log('Player Stats table has been created or updated.');
})
.catch(err => {
    console.error('Error creating/updating Player Stats table:', err);
});

module.exports = PlayerStat;