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

// Sync the table without altering the column with a default value
Article.sync()
    .then(() => {
        console.log('News table has been created or updated successfully.');
    })
    .catch(async (err) => {
        console.error('Failed to sync the table:', err);
    });

module.exports = Article;