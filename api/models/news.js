// models/news.js

const { DataTypes } = require('sequelize');
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
  }
}, {
  timestamps: false,
  tableName: 'news' 
});

// Sync the model with the database
Article.sync({ alter: true })
.then(() => {
    console.log('News table has been created or updated.');
})
.catch(err => {
    console.error('Error creating/updating News table:', err);
});

module.exports = Article;
