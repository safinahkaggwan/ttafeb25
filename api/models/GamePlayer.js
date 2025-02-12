const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Game = require('./games');
const Player = require('./player');

const GamePlayer = sequelize.define('GamePlayer', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    gmid: {
        type: DataTypes.UUID,
        references: {
            model: Game,
            key: 'gmid',
        },
        allowNull: false,
    },
    pid: {
        type: DataTypes.UUID,
        references: {
            model: Player,
            key: 'pid',
        },
        allowNull: false,
    },   
    gteam: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
            isIn: [['A', 'B']]
        }
    },
    score: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    }
}, {
    timestamps: false,
    tableName: 'GamePlayer',
    indexes: [
        {
            unique: true,
            fields: ['gmid', 'pid']
        }
    ]
});

// // Sync the model
// GamePlayer.sync({ alter: true })
// .then(() => {
//     console.log('GamePlayer table has been created or updated.');
// });

module.exports = GamePlayer;