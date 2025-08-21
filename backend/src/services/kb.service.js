// src/services/kb.service.js
const Article = require('../models/Article');
const logger = require('../utils/logger');

const createArticle = async (articleData) => {
  const article = await Article.create(articleData);
  logger.info('KB Article created', { articleId: article._id });
  return article;
};

const getArticles = async (query = '', limit = 10) => {
  // Simple text search in title, body, tags
  const searchQuery = query
    ? {
        $and: [
          { status: 'published' },
          {
            $or: [
              { title: { $regex: query, $options: 'i' } },
              { body: { $regex: query, $options: 'i' } },
              { tags: { $in: [new RegExp(query, 'i')] } }
            ]
          }
        ]
      }
    : { status: 'published' };

  const articles = await Article.find(searchQuery).limit(limit);
  logger.debug('KB Articles fetched', { query, count: articles.length });
  return articles;
};

const getArticleById = async (id) => {
  const article = await Article.findById(id);
  if (!article) {
    throw new Error('Article not found');
  }
  return article;
};

const updateArticle = async (id, updateData) => {
  const article = await Article.findByIdAndUpdate(id, updateData, {
    new: true, // Return updated doc
    runValidators: true,
  });
  if (!article) {
    throw new Error('Article not found');
  }
  logger.info('KB Article updated', { articleId: article._id });
  return article;
};

const deleteArticle = async (id) => {
  const article = await Article.findByIdAndDelete(id);
  if (!article) {
    throw new Error('Article not found');
  }
  logger.info('KB Article deleted', { articleId: article._id });
  return article;
};

module.exports = {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
};