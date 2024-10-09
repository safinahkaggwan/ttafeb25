const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Group = sequelize.define('Group', {
    gid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    gname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    desc: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    timestamps: true,  // Automatically adds createdAt and updatedAt fields
    tableName: 'group'  // Specify the table name explicitly if necessary
  });
  
  Group.sync({ alter: true })
      .then(() => {
          console.log('Group table has been created or updated.');
      })
      .catch(err => {
          console.error('Error creating/updating Group table:', err);
      });
  
  module.exports = Group;