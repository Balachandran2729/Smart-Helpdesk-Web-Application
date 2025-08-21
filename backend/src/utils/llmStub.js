// src/utils/llmStub.js
const Article = require('../models/Article');
const logger = require('./logger');

// --- Deterministic LLM Stub Implementation ---

/**
 * Simulates LLM classification based on keywords.
 * @param {string} text - The text to classify (ticket title/description).
 * @returns {Object} - { predictedCategory: string, confidence: number }
 */
const classifyStub = (text) => {
  const lowerText = text.toLowerCase();
  let category = 'other';
  let confidence = 0.5; // Base confidence

  // Simple keyword matching with confidence boost
  if (lowerText.includes('refund') || lowerText.includes('invoice') || lowerText.includes('billing') || lowerText.includes('payment')) {
    category = 'billing';
    confidence = Math.min(1, confidence + 0.4 + (lowerText.includes('refund') ? 0.1 : 0));
  } else if (lowerText.includes('error') || lowerText.includes('bug') || lowerText.includes('stack') || lowerText.includes('crash') || lowerText.includes('500') || lowerText.includes('not working')) {
    category = 'tech';
    confidence = Math.min(1, confidence + 0.4 + (lowerText.includes('error') ? 0.1 : 0));
  } else if (lowerText.includes('delivery') || lowerText.includes('shipment') || lowerText.includes('tracking') || lowerText.includes('package') || lowerText.includes('delayed')) {
    category = 'shipping';
    confidence = Math.min(1, confidence + 0.4 + (lowerText.includes('tracking') ? 0.1 : 0));
  }

  // Add a bit of randomness or variation if needed, but keep it deterministic for testing
  // For now, it's fully deterministic based on keywords.

  logger.debug('Classification Stub Result', { inputText: text, category, confidence });
  return { predictedCategory: category, confidence };
};

/**
 * Simulates LLM draft reply generation.
 * @param {string} ticketText - The original ticket text.
 * @param {Array} articles - Array of relevant Article documents.
 * @returns {Object} - { draftReply: string, citations: string[] }
 */
const draftStub = (ticketText, articles) => {
  if (!articles || articles.length === 0) {
    return {
      draftReply: "I couldn't find specific information related to your query. A human agent will review your ticket shortly.",
      citations: []
    };
  }

  let reply = "Based on your query, here are some relevant articles that might help:\n\n";
  const citations = [];

  articles.slice(0, 3).forEach((article, index) => { // Top 3
    reply += `${index + 1}. **${article.title}**: ${article.body.substring(0, 100)}...\n\n`; // Truncate body
    citations.push(article._id.toString());
  });

  reply += "\nPlease review the above information. If it doesn't resolve your issue, a human agent will assist you.";

  logger.debug('Drafting Stub Result', { ticketText, articleCount: articles.length, replyLength: reply.length });
  return { draftReply: reply, citations };
};

/**
 * Simple keyword-based KB retrieval stub.
 * @param {string} query - The search query (ticket title/description).
 * @returns {Promise<Array>} - Array of { article: Article, score: number }
 */
const retrieveKBStub = async (query) => {
  try {
    const lowerQuery = query.toLowerCase();
    const words = lowerQuery.split(/\s+/).filter(w => w.length > 2); // Simple tokenization

    if (words.length === 0) {
      // If query is too short, return recent published articles
      const recentArticles = await Article.find({ status: 'published' }).sort({ updatedAt: -1 }).limit(5);
      return recentArticles.map(article => ({ article, score: 0.1 }));
    }

    // Find published articles
    const articles = await Article.find({ status: 'published' });

    const scoredArticles = articles.map(article => {
      const lowerTitle = article.title.toLowerCase();
      const lowerBody = article.body.toLowerCase();
      const lowerTags = article.tags.map(t => t.toLowerCase());

      let score = 0;

      words.forEach(word => {
        // Score based on title, body, tags
        const inTitle = (lowerTitle.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
        const inBody = (lowerBody.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
        const inTags = lowerTags.filter(tag => tag.includes(word)).length;

        score += (inTitle * 3) + (inBody * 1) + (inTags * 2); // Weight title more
      });

      return { article, score };
    });

    // Sort by score descending and filter out zero scores
    const filteredAndSorted = scoredArticles
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    logger.debug('KB Retrieval Stub Result', { query, foundArticles: filteredAndSorted.length });
    return filteredAndSorted.slice(0, 3); // Return top 3
  } catch (err) {
    logger.error('KB Retrieval Stub Error', { error: err.message });
    return []; // Return empty on error
  }
};

module.exports = {
  classifyStub,
  draftStub,
  retrieveKBStub
};