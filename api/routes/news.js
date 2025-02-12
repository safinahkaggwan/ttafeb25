const express = require('express');
const router = express.Router();
//const checkAuth = require('../middleware/check-auth');

const newsController = require('../controllers/news')

router.get('/', newsController.getAllArticles);

// router.post('/', checkAuth, newsController.createArticle);
router.post('/',newsController.createArticle);

// router.get('/:articleId', checkAuth, newsController.getArticleById);
router.get('/:articleId',newsController.getArticleById);

// router.patch('/:articleId', checkAuth, newsController.updateArticle);
router.patch('/:articleId',newsController.updateArticle);

// router.delete('/:articleId', checkAuth,newsController.deleteArticle);
router.delete('/:articleId',newsController.deleteArticle);

module.exports = router; 