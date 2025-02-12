const jwt = require('jsonwebtoken');
const Article = require('../models/news');

// Get all Articles
exports.getAllArticles = (req, res) => {
    Article.findAll({
        attributes: ['nid', 'author', 'ndate', 'ntitle', 'arti', 'status']
    })
        .then(articles => {
            const response = {
                count: articles.length,
                articles: articles.map(article => ({
                    nid: article.nid,
                    author: article.author,
                    ndate: article.ndate,
                    ntitle: article.ntitle,
                    arti: article.arti,
                    status: article.status,
                    request: {
                        type: 'GET',
                        url: `http://localhost:5500/articles/${article.nid}`
                    }
                }))
            };
            res.status(200).json(response);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.message });
        });
};

// Add a new Article
exports.createArticle = (req, res) => {
    Article.create({
        author: req.body.author,
        ndate: req.body.ndate,
        ntitle: req.body.ntitle,
        arti: req.body.arti,
        status: req.body.status || false // Default to false if not provided
    })
        .then(result => {
            res.status(201).json({
                message: 'Article created successfully',
                createdArticle: result
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.message });
        });
};

// Get an Article by ID
exports.getArticleById = (req, res) => {
    const nid = req.params.articleId;
    Article.findByPk(nid, {
        attributes: ['nid', 'author', 'ndate', 'ntitle', 'arti', 'status']
    })
        .then(article => {
            if (article) {
                res.status(200).json(article);
            } else {
                res.status(404).json({ message: 'Article not found' });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.message });
        });
};

// Update an Article by ID
exports.updateArticle = async (req, res) => {
    const nid = req.params.articleId;
    const updateOps = {};

    try {
        if (typeof req.body !== 'object' || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "Invalid request body" });
        }

        Object.entries(req.body).forEach(([key, value]) => {
            updateOps[key] = value;
        });

        const result = await Article.update(updateOps, { where: { nid } });

        if (result[0] === 0) {
            return res.status(404).json({ message: "Article not found or no changes made" });
        }

        res.status(200).json({ message: "Article updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Delete an Article by ID
exports.deleteArticle = (req, res) => {
    const nid = req.params.articleId;
    Article.destroy({ where: { nid } })
        .then(result => {
            if (result) {
                res.status(200).json({ message: 'Article deleted' });
            } else {
                res.status(404).json({ message: 'Article not found' });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.message });
        });
};
