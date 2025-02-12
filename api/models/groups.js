const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Grp = sequelize.define('Grp', {
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
    tableName: 'grps'  // Specify the table name explicitly if necessary
  });
  
  Grp.sync({ alter: true })
      .then(() => {
          console.log('Group table has been created or updated.');
      })
      .catch(err => {
          console.error('Error creating/updating Group table:', err);
      });
  
  module.exports = Grp;