// src/routes/kb.routes.js
const express = require('express');
const { protect, authorize } = require('../middlewares/auth');
const {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
} = require('../controllers/kb.controller');

const router = express.Router();

router.route('/')
  .get(getArticles) // Public search
  .post(protect, authorize('admin'), createArticle); // Admin only

router.route('/:id')
  .get(getArticleById) // Public
  .put(protect, authorize('admin'), updateArticle) // Admin only
  .delete(protect, authorize('admin'), deleteArticle); // Admin only

module.exports = router;