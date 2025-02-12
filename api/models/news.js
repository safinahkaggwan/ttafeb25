const {DataTypes} = require('sequelize');
const sequelize = require('../db');

const Article = sequelize.define('news', {
    nid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    author: {
        type: DataTypes.STRING(35)
    },
    ndate: {
        type: DataTypes.DATE
    },
    ntitle: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    arti: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        get() {
            return Boolean(this.getDataValue('status'));
        }
    }
}, {
    timestamps: false,
    tableName: 'news'
});

// First try to drop the table and recreate it
Article.sync({force: true})
    .then(() => {
        console.log('News table has been created successfully.');
    })
    .catch(async (err) => {
        console.error('Failed with force sync, trying manual creation:', err);
        try {
            // If the table already exists, try to alter it safely
            await sequelize.query(`
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'news')
        BEGIN
          CREATE TABLE news (
            nid UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
            author NVARCHAR(35),
            ndate DATETIME,
            ntitle NVARCHAR(255) NOT NULL,
            arti NVARCHAR(MAX) NOT NULL,
            status BIT CONSTRAINT DF_News_Status DEFAULT 0 NOT NULL
          )
        END
      `);
            console.log('News table has been created or verified.');
        } catch (error) {
            console.error('Error in manual table creation:', error);
        }
    });

module.exports = Article;