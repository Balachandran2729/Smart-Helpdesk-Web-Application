// src/services/kb.service.js
const Article = require('../models/Article');
const logger = require('../utils/logger');

const createArticle = async (articleData) => {
  const article = await Article.create(articleData);
  logger.info('KB Article created', { articleId: article._id });
  return article;
};

const getArticles = async (query = '', limit = 10, status = null) => {
  // Build the base query object
  let searchQuery = {};
  // Use an object to store conditions for the main filter part
  let statusCondition = {};

  logger.debug('KB Service: getArticles called', { query, limit, status }); // Log inputs

  // --- Correctly handle the status filter ---
  if (status === 'all' || status === null || status === undefined) {
    logger.debug('KB Service: No specific status filter, fetching all articles.');
    // statusCondition remains an empty object {}
  } else if (status === 'published' || status === 'draft') {
    // If a specific valid status is requested, filter by it.
    statusCondition = { status: status };
    logger.debug('KB Service: Filtering articles by status', { status });
  } else {
    // Handle unexpected status values gracefully, perhaps log a warning
    // and default to fetching all or published only.
    logger.warn(`KB Service: Unexpected status filter value '${status}', defaulting to fetching all articles.`);
    // statusCondition remains empty to fetch all
  }

  // --- Apply status condition to searchQuery ---
  // Object.assign or spread the status condition into the main searchQuery
  searchQuery = { ...searchQuery, ...statusCondition };

  // --- Apply text search if query is provided ---
  if (query) {
    logger.debug('KB Service: Applying text search query', { query });
    searchQuery.$or = [
      { title: { $regex: query, $options: 'i' } },
      { body: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ];
  }
  logger.debug('KB Service: Final Mongoose search query', searchQuery); // Log the final query
  try {
    // --- Execute the query ---
    const articles = await Article.find(searchQuery).limit(limit);
    logger.info('KB Service: Articles fetched successfully', { count: articles.length, query, status });
    return articles; // Return the array directly
  } catch (err) {
    logger.error('KB Service: Error fetching articles', { error: err.message, query, status, searchQuery });
    throw err; // Re-throw to be handled by controller
  }
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