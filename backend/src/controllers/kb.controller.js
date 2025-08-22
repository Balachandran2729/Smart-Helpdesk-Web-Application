// src/controllers/kb.controller.js
const kbService = require('../services/kb.service');

// @desc    Create a new KB article
// @route   POST /api/kb
// @access  Private/Admin
const createArticle = async (req, res, next) => {
  try {
    const article = await kbService.createArticle(req.body);
    res.status(201).json({
      success: true,
      data: article,
    });
  } catch (error) {
    next(error);
  }
};

const getArticles = async (req, res, next) => {
  try {
    const query = req.query.query || '';
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || null; // Get status from query params
    const articles = await kbService.getArticles(query, limit, status); // Pass status
    res.status(200).json({
      success: true,
      count: articles.length,
       articles, // Use 'articles' property as per your current structure
    });
  } catch (error) {
    next(error);
  }
};


const getArticleById = async (req, res, next) => {
  try {
    const article = await kbService.getArticleById(req.params.id);
    res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a KB article
// @route   PUT /api/kb/:id
// @access  Private/Admin
const updateArticle = async (req, res, next) => {
  try {
    const article = await kbService.updateArticle(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a KB article
// @route   DELETE /api/kb/:id
// @access  Private/Admin
const deleteArticle = async (req, res, next) => {
  try {
    await kbService.deleteArticle(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
};