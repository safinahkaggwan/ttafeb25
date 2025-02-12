const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Roles = require('./roles');
const RoleAccess = require('./roleaccess');
const AccessRight = require('./accessright');

const User = sequelize.define('Users', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    useremail: {
        type: DataTypes.STRING,
        allowNull: false,
        // unique: true, // Ensure unique email
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: true,
    tableName: 'users'
});

// Associate User with Role
User.belongsTo(Roles, { foreignKey: 'roleId', onDelete: 'CASCADE' });

// Ensure User has access to RoleAccess via Role
Roles.hasMany(RoleAccess, { foreignKey: 'roleId', onDelete: 'CASCADE' });
RoleAccess.belongsTo(AccessRight, { foreignKey: 'accid', onDelete: 'CASCADE' });

// Sync the model with the database
User.sync({ alter: true })
    .then(() => {
        console.log('User table has been created or updated.');
    })
    .catch(err => {
        console.error('Error creating/updating User table:', err);
    });

module.exports = User;
