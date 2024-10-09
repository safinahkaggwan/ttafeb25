// models/club.js

const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Club = sequelize.define('Club', {
  cid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cname: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  ccontact: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  cemail: {
    type: DataTypes.STRING(35),
  },
  onboarddate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  slogan: {
    type: DataTypes.STRING(20),
  },
  logo: {
    type: DataTypes.BLOB,
  },
}, {
  timestamps: false,
  tableName: 'club'
});

Club.sync({ alter: true })
.then(() => {
    console.log('Club table has been created or updated.');
})
.catch(err => {
    console.error('Error creating/updating Club table:', err);
});

module.exports = Club;
