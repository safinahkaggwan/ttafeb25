const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Club = require('./clubs');
const Group = require('./groups');

const Player = sequelize.define('Player', {
  pid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  pfname: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  psname: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  poname: {
    type: DataTypes.STRING(10),
  },
  pcontact: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  paltcontact: {
    type: DataTypes.STRING(15),
  },
  pemail: {
    type: DataTypes.STRING(30),
  },
  gender: {
    type: DataTypes.TINYINT,  // You can change this to ENUM if needed
    allowNull: false,
  },
  dob: {
    type: DataTypes.DATE,
    allowNull: false,
  }
}, {
  timestamps: false,
  tableName: 'players'
});

// Associations
Player.belongsTo(Club, { foreignKey: 'cid', onDelete: 'CASCADE' });
Player.belongsTo(Group, { foreignKey: 'gid', onDelete: 'CASCADE' });

// Sync the model
Player.sync({ alter: true })
.then(() => {
    console.log('Player table has been created or updated.');
})
.catch(err => {
    console.error('Error creating/updating Player table:', err);
});

module.exports = Player;
