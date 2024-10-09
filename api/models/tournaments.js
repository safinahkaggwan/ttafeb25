// models/tournament.js

const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Tournament = sequelize.define('Tournament', {
  tid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tname: {
    type: DataTypes.STRING(35),
    allowNull: false,
  },
  tlocation: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  tdate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: false,
  tableName: 'tournaments' 
});

Tournament.sync({ alter: true })
.then(() => {
    console.log('Tounarment table has been created or updated.');
})
.catch(err => {
    console.error('Error creating/updating Tournament table:', err);
});

module.exports = Tournament;
