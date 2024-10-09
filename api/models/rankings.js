// const { DataTypes } = require('sequelize');
// const sequelize = require('../db');
// const Game = require('./games');
// const Group = require('./groups');
// const Player = require('./player');
// const Tournament = require('./tournaments');

// const Ranking = sequelize.define('Ranking', {
//   rid: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true,
//   },
//   scpoints: {
//     type: DataTypes.STRING(50),
//     allowNull: false,
//   }
// }, {
//   timestamps: false,
//   tableName: 'rankings'
// });

// // Associations
// Ranking.belongsTo(Player, { foreignKey: 'pid', onDelete: 'CASCADE' });
// Ranking.belongsTo(Group, { foreignKey: 'gid', onDelete: 'CASCADE' });
// Ranking.belongsTo(Game, { foreignKey: 'lid', onDelete: 'CASCADE' });
// Ranking.belongsTo(Tournament, { foreignKey: 'tid', onDelete: 'CASCADE' });

// Ranking.sync({ alter: true })
// .then(() => {
//     console.log('Rankings table has been created or updated.');
// })
// .catch(err => {
//     console.error('Error creating/updating Rankings table:', err);
// });

// module.exports = Ranking;
