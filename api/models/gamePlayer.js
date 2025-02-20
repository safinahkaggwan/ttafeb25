const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const GamePlayer = sequelize.define('GamePlayer', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    gmid: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    pid: {
        type: DataTypes.UUID,
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
    },
    score: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    set1Score: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    set2Score: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    set3Score: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    }
}, {
    timestamps: false,
    tableName: 'gameplayer',
    indexes: [
        {
            unique: true,
            fields: ['gmid', 'pid']
        }
    ]
});

// Define associations
GamePlayer.associate = (models) => {
    GamePlayer.belongsTo(models.Game, {
        foreignKey: 'gmid',
        onDelete: 'CASCADE'
    });

    GamePlayer.belongsTo(models.Player, {
        foreignKey: 'pid',
        onDelete: 'CASCADE'
    });
};

module.exports = GamePlayer;