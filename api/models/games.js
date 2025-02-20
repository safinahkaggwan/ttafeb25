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
    }
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

Game.sync({ alter: true })
.then(() => {
    console.log('Game table has been created or updated.');
})
.catch(err => {
    console.error('Error creating/updating Game table:', err);
});

module.exports = Game;