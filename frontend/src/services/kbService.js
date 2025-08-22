import api from './api';

const getArticles = async (params = {}) => {
  let queryString = '';
  if (Object.keys(params).length > 0) {
    const urlParams = new URLSearchParams(params);
    queryString = `?${urlParams.toString()}`;
  }
  try {
    const response = await api.get(`/kb${queryString}`);
    if (response.data && response.data.success === true) {
      if (Array.isArray(response.data.articles)) {
        return response.data.articles; 
      } else {
        console.error('kbService: Expected response.data.articles to be an array, got:', response.data.articles, 'Type:', typeof response.data.articles);
        return [];
      }
    } else {
      console.error('kbService: API request was not successful or returned unexpected structure. Response:', response.data);
      if (response.data && response.data.success === false) {
         throw new Error(response.data.message || 'API request failed.');
      }
      return [];
    }
  } catch (error) {
    console.error('kbService: Network or API error while fetching articles:', error);
    throw error; 
  }
};

const getArticleById = async (id) => {
  try {
    const response = await api.get(`/kb/${id}`);
    if (response.data && response.data.success === true) {
      let articleData = null;
      if (response.data.data && typeof response.data.data === 'object' && !Array.isArray(response.data.data)) {
        articleData = response.data.data;
      } else if (response.data.article && typeof response.data.article === 'object') {
        articleData = response.data.article;
      }

      if (articleData) {
        return articleData; 
      } else {
        console.error('kbService: Expected response.data.data or response.data.article to be an object for single article, got data:', response.data.data, 'article:', response.data.article);
        throw new Error('Invalid article data format received.');
      }
    }
    console.error('kbService: Error or unexpected structure fetching article by ID:', response.data);
    throw new Error(response.data?.message || 'Failed to fetch article');
  } catch (error) {
     console.error('kbService: Error in getArticleById:', error);
     throw error;
  }
};
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
          return articleResult; 
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