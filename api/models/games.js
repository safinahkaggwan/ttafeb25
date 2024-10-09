// const { DataTypes } = require('sequelize');
// const sequelize = require('../db');
// const Group = require('./groups');
// const Player = require('./player');
// const Tournament = require('./tournaments');

// const Game = sequelize.define('Game', {
//   lid: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   lname: {
//     type: DataTypes.STRING(35),
//     allowNull: false,
//   },
//   // Foreign key for Player One
//   poid: {
//     type: DataTypes.INTEGER,
//     references: {
//       model: Player,
//       key: 'pid'
//     },
//     allowNull: false,
//   },
//   // Foreign key for Player Two
//   ptid: {
//     type: DataTypes.INTEGER,
//     references: {
//       model: Player,
//       key: 'pid'
//     },
//     allowNull: false,
//   },
//   po_score: {
//     type: DataTypes.INTEGER
//   },
//   pt_score: {
//     type: DataTypes.INTEGER
//   },

// }, {
//   timestamps: false,
//   tableName: 'game'
// });

// // Associations
// // Two associations for players: Player One and Player Two
// Game.belongsTo(Player, { as: 'PlayerOne', foreignKey: 'poid', onDelete: 'CASCADE' });
// Game.belongsTo(Player, { as: 'PlayerTwo', foreignKey: 'ptid', onDelete: 'CASCADE' });

// // Group and Tournament associations
// Game.belongsTo(Group, { foreignKey: 'gid', onDelete: 'CASCADE' });
// Game.belongsTo(Tournament, { foreignKey: 'tid', onDelete: 'CASCADE' });

// // Sync the model
// Game.sync({ alter: true })
// .then(() => {
//     console.log('Game table has been created or updated.');
// })
// .catch(err => {
//     console.error('Error creating/updating Game table:', err);
// });

// module.exports = Game;
