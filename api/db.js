const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('db_ab2b45_ttadbtz', 'db_ab2b45_ttadbtz_admin', 'tta@123!!', {
    host: 'SQL1002.site4now.net',
    dialect: 'mssql',
    dialectOptions: {
        options: {
            encrypt: true, // For Azure SQL Database encryption
            trustServerCertificate: false, // Set to true for development, false for production
        }
    },
    port: 1433,
    logging: false,  // Disable logging (optional)
});

sequelize.authenticate()
.then(() => {
    console.log('Connection to db has been established successfully.');
})
.catch(err => {
    console.error('Unable to connect to the db database:', err);
});

module.exports = sequelize;

