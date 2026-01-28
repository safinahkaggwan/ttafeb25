const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('db_ac3a32_tanzaniatta001', 'db_ac3a32_tanzaniatta001_admin', 'TTAtz2026!!', {
    host: 'SQL8010.site4now.net',
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

