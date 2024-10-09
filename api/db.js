
const { Sequelize } = require('sequelize');
const mysql = require('mysql2')

// Azure SQL Connection with Sequelize

const sequelize = new Sequelize('db_aadbe1_adrion01', 'db_aadbe1_adrion01_admin', 'adrion@123!!', {
host: 'SQL5110.site4now.net',
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

// Test connection to the Azure SQL Database
sequelize.authenticate()
.then(() => {
    console.log('Connection to db has been established successfully.');
})
.catch(err => {
    console.error('Unable to connect to the db database:', err);
});

module.exports = sequelize;

