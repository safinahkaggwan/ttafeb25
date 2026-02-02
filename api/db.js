const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'db_ac3a32_tanzaniatta001',
    process.env.DB_USER || 'db_ac3a32_tanzaniatta001_admin',
    process.env.DB_PASSWORD || 'TTAtz2026',
    {
        host: process.env.DB_HOST || 'SQL8010.site4now.net',
        dialect: 'mssql',
        dialectOptions: {
            options: {
                encrypt: true,
                trustServerCertificate: false,
            }
        },
        port: process.env.DB_PORT || 1433,
        logging: false,
    }
);

sequelize.authenticate()
.then(() => {
    console.log('Connection to db has been established successfully.');
})
.catch(err => {
    console.error('Unable to connect to the db database:', err);
});

module.exports = sequelize;