const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Club = require('./clubs');
const Grp = require('./groups');

const Player = sequelize.define('Player', {
  pid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
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
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['male', 'female']], // Validate value
    },
  },
  dob: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: false,
  tableName: 'players'
});

// Associations
Player.belongsTo(Club, { foreignKey: 'cid', onDelete: 'CASCADE' });
Player.belongsTo(Grp, { foreignKey: 'gid', onDelete: 'CASCADE' });

// Sync the model
Player.sync({ alter: true })
.then(() => {
    console.log('Player table has been created or updated.');
})
.catch(err => {
    console.error('Error creating/updating Player table:', err);
});

module.exports = Player;
