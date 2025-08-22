// src/services/kbService.js
import api from './api';

// --- Corrected getArticles to match backend { success: true, count: ..., articles: [...] } ---
const getArticles = async (params = {}) => {
  let queryString = '';
  if (Object.keys(params).length > 0) {
    const urlParams = new URLSearchParams(params);
    queryString = `?${urlParams.toString()}`;
  }
  try {
    const response = await api.get(`/kb${queryString}`);
    console.log('kbService: Raw API response for getArticles:', response); // Debug log

    // --- Handle the actual backend response structure ---
    // Expected: { success: true, count: ..., articles: [...] }
    if (response.data && response.data.success === true) {
      // --- Access the articles array from the 'articles' property ---
      if (Array.isArray(response.data.articles)) {
        console.log("kbService: Successfully fetched articles array from response.data.articles.");
        return response.data.articles; // Return the articles array directly
      } else {
        console.error('kbService: Expected response.data.articles to be an array, got:', response.data.articles, 'Type:', typeof response.data.articles);
        // Return empty array on unexpected structure for the array part
        return [];
      }
    } else {
      // Handle case where response.data.success is false or structure is different
      console.error('kbService: API request was not successful or returned unexpected structure. Response:', response.data);
      // If it's an explicit failure from backend
      if (response.data && response.data.success === false) {
         throw new Error(response.data.message || 'API request failed.');
      }
      // For other unexpected structures, return empty array or throw
      return [];
    }
  } catch (error) {
    // This catches network errors, timeouts, Axios errors
    console.error('kbService: Network or API error while fetching articles:', error);
    throw error; // Re-throw to let KBListPage handle it
  }
};

// --- Corrected getArticleById to match likely backend structure for single item ---
const getArticleById = async (id) => {
  try {
    const response = await api.get(`/kb/${id}`);
    console.log('kbService: Raw API response for getArticleById:', response); // Debug log

    // Assuming backend returns { success: true,  { ...articleObject } } OR { success: true, article: { ... } }
    if (response.data && response.data.success === true) {
      // Prioritize 'data' then 'article' property for the actual object
      let articleData = null;
      if (response.data.data && typeof response.data.data === 'object' && !Array.isArray(response.data.data)) {
        articleData = response.data.data;
        console.log("kbService: Successfully fetched article from response.data.data.");
      } else if (response.data.article && typeof response.data.article === 'object') {
        articleData = response.data.article;
        console.log("kbService: Successfully fetched article from response.data.article.");
      }

      if (articleData) {
        return articleData; // Return the article object
      } else {
        console.error('kbService: Expected response.data.data or response.data.article to be an object for single article, got data:', response.data.data, 'article:', response.data.article);
        throw new Error('Invalid article data format received.');
      }
    }
    // Handle error or unexpected structure
    console.error('kbService: Error or unexpected structure fetching article by ID:', response.data);
    throw new Error(response.data?.message || 'Failed to fetch article');
  } catch (error) {
     console.error('kbService: Error in getArticleById:', error);
     throw error;
  }
};

// --- Ensure other service functions also align ---
// Assuming backend for create/update returns { success: true,  { ... } } or { success: true, article: { ... } }
const createArticle = async (articleData) => {
  try {
    const response = await api.post('/kb', articleData);
    if (response.data && response.data.success === true) {
       let articleResult = null;
       if (response.data.data && typeof response.data.data === 'object') {
          articleResult = response.data.data;
       } else if (response.data.article && typeof response.data.article === 'object') {
          articleResult = response.data.article;
       }
       if (articleResult) {
          return articleResult; // Return the created article object
       } else {
         console.error('kbService: Expected response.data.data or response.data.article for created article, got:', response.data);
         throw new Error('Invalid created article data format received.');
       }
    }
    throw new Error(response.data?.message || 'Failed to create article');
  } catch (error) {
     console.error('kbService: Error in createArticle:', error);
     throw error;
  }
};

const updateArticle = async (id, articleData) => {
  try {
    const response = await api.put(`/kb/${id}`, articleData);
    if (response.data && response.data.success === true) {
       let articleResult = null;
       if (response.data.data && typeof response.data.data === 'object') {
          articleResult = response.data.data;
       } else if (response.data.article && typeof response.data.article === 'object') {
          articleResult = response.data.article;
       }
       if (articleResult) {
          return articleResult; // Return the updated article object
       } else {
         console.error('kbService: Expected response.data.data or response.data.article for updated article, got:', response.data);
         throw new Error('Invalid updated article data format received.');
       }
    }
    throw new Error(response.data?.message || 'Failed to update article');
  } catch (error) {
     console.error('kbService: Error in updateArticle:', error);
     throw error;
  }
};

// Delete might return { success: true, message: ... } or the deleted item
const deleteArticle = async (id) => {
  try {
    const response = await api.delete(`/kb/${id}`);
    if (response.data && response.data.success === true) {
      // Return the response data (could be a message or the deleted article object)
      return response.data;
    }
    throw new Error(response.data?.message || 'Failed to delete article');
  } catch (error) {
     console.error('kbService: Error in deleteArticle:', error);
     throw error;
  }
};

const kbService = {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
};

export default kbService;