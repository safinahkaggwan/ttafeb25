// models/Role.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const AccessRight = require('./accessright');

const Roles = sequelize.define('Roles', {
    roleId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        // unique: true,
    },
    description: {
        type: DataTypes.STRING,
    }
}, {
    timestamps: true,
    tableName: 'Roles'
});

Roles.belongsToMany(AccessRight, {
    through: 'RoleAccess',
    foreignKey: 'roleId',
    otherKey: 'accid',
});

// Sync the model
Roles.sync({ alter: true })
.then(() => {
    console.log('Roles table has been created or updated.');
})
.catch(err => {
    console.error('Error creating/updating Roles table:', err);
});

module.exports = Roles;
