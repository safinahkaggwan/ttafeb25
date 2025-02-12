const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Roles = require('./roles');
const AccessRight = require('./accessright');

// Define the RoleAccess join table with an additional 'score' column
const RoleAccess = sequelize.define('RoleAccess', {
    roleId: {
        type: DataTypes.UUID,
        references: {
            model: Roles,
            key: 'roleId'
        },
        allowNull: false,
    },
    accid: {
        type: DataTypes.UUID,
        references: {
            model: AccessRight,
            key: 'accid'
        },
        allowNull: false,
    }
}, {
    timestamps: false,
    tableName: 'RoleAccess'
});

// Sync the RoleAccess table
RoleAccess.sync({ alter: true })
    .then(() => {
        console.log('RoleAccess table has been created or updated.');
    })
    .catch(err => {
        console.error('Error creating/updating RoleAccess table:', err);
    });

module.exports = RoleAccess;
