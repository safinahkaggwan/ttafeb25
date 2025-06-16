const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize('db_aba60f_ttasystem25', 'db_aba60f_ttasystem25_admin', '2025TTA#system', {
//     host: 'SQL1003.site4now.net',
//     dialect: 'mssql',
//     dialectOptions: {
//         options: {
//             encrypt: true, // For Azure SQL Database encryption
//             trustServerCertificate: false, // Set to true for development, false for production
//         }
//     },
//     port: 1433,
//     logging: false,  // Disable logging (optional)
// });

const sequelize = new Sequelize('ttazproject', 'saf', 'sa', {
    host: 'localhost',
    dialect: 'mssql',
    port: 1433,
    dialectOptions: {
        options: {
            encrypt: false, // Set to true if using Azure SQL or require encryption
            trustServerCertificate: true // Recommended true for local development
        }
    },
    logging: false // Disable SQL query logging
});

sequelize.authenticate()
.then(() => {
    console.log('Connection to db has been established successfully.');
})
.catch(err => {
    console.error('Unable to connect to the db database:', err);
});

module.exports = sequelize;

