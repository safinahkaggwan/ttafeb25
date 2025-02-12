// models/programs.js

const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Program = sequelize.define('Program', {
  prid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  prname: {
    type: DataTypes.STRING(35),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
}, {
  timestamps: false,
  tableName: 'programs' 
});

Program.sync({ alter: true })
.then(() => {
    console.log('Program table has been created or updated.');
})
.catch(err => {
    console.error('Error creating/updating Program table:', err);
});

module.exports = Program;
