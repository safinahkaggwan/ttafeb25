const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Game = sequelize.define('Game', {
    gmid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    gtype: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['singles', 'doubles']]
        },
    },
    gmname: {
        type: DataTypes.STRING(35),
        allowNull: false,
    },
    tid: {
        type: DataTypes.UUID,
        allowNull: false
    },
    gid: {
        type: DataTypes.UUID,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'not started',
        validate: {
            isIn: [['active', 'completed', 'cancelled', 'not started']]
        },
    },
}, {
    timestamps: false,
    tableName: 'games',
});

// Define associations
Game.associate = (models) => {
    Game.hasMany(models.GamePlayer, {
        foreignKey: 'gmid',
        as: 'GamePlayers',
        onDelete: 'CASCADE'
    });

    Game.belongsToMany(models.Player, {
        through: models.GamePlayer,
        foreignKey: 'gmid',
        otherKey: 'pid'
    });

    Game.belongsTo(models.Tournament, { foreignKey: 'tid' });
    Game.belongsTo(models.Grp, { foreignKey: 'gid' });
};

Game.sync()
.then(async () => {
    try {
        // Check if the column exists first
        await sequelize.query(`
            IF NOT EXISTS (
                SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'games' AND COLUMN_NAME = 'status'
            )
            BEGIN
                ALTER TABLE games ADD status NVARCHAR(255) NOT NULL DEFAULT 'not started'
            END
        `);
        console.log('Game table has been created or updated.');
    } catch (err) {
        console.error('Error updating Game table:', err);
    }
})
.catch(err => {
    console.error('Error creating Game table:', err);
});

module.exports = Game;
