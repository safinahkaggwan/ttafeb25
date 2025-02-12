// models/AccessRight.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const AccessRight = sequelize.define('AccessRight', {
    accid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    right: {
        type: DataTypes.STRING,
        allowNull: false,
        // unique: true,
    },
    description: {
        type: DataTypes.STRING,
    }
}, {
    timestamps: true,
    tableName: 'AccessRight'
});

// Sync the model
AccessRight.sync({ alter: true })
.then(() => {
    console.log('AccessRight table has been created or updated.');
})
.catch(err => {
    console.error('Error creating/updating AccessRight table:', err);
});

module.exports = AccessRight;
