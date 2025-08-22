// src/pages/KBListPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import kbService from '../services/kbService';
import { FaPlus, FaSearch, FaEdit, FaTrash } from 'react-icons/fa';

const KBListPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'published', 'draft'

useEffect(() => {
  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      let apiParams = {};
      // --- Send status parameter including 'all' ---
      // The backend should now correctly interpret status='all'
      if (statusFilter) { // This covers 'all', 'published', 'draft'
          apiParams.status = statusFilter;
      }

      console.log("KBListPage: Fetching articles with params:", apiParams); // Debug log
      // --- kbService.getArticles now returns the articles array directly ---
      const fetchedArticles = await kbService.getArticles(apiParams);
      console.log("KBListPage: Fetched articles array:", fetchedArticles); // Debug log

      // --- Ensure fetchedArticles is an array before setting state ---
      if (Array.isArray(fetchedArticles)) {
        setArticles(fetchedArticles);
        console.log("KBListPage: Articles state updated successfully.");
      } else {
        // This should ideally not happen with the corrected service, but good check
        console.error('KBListPage: kbService.getArticles did not return an array:', fetchedArticles);
        setArticles([]);
        // Optionally set an error state if the format is consistently wrong
        // setError('Data format error: Articles list is not an array.');
      }
    } catch (err) { // --- This should now correctly catch network errors or errors thrown by kbService ---
      console.error('KBListPage: Fetch articles error caught in catch block:', err);
      // Improve error message extraction
      let errorMsg = 'An unknown error occurred.';
      if (err.response) {
        // Server responded with error status
        errorMsg = err.response.data?.message || `Server error (${err.response.status})`;
      } else if (err.request) {
        // Request made but no response received
        errorMsg = 'Network error. Please check your connection.';
      } else {
        // Error setting up the request
        errorMsg = err.message || 'Failed to fetch articles.';
      }
      setError(errorMsg);
      toast.error(errorMsg);
      setArticles([]); // Ensure articles is reset on error
    } finally {
      setLoading(false);
    }
  };

  fetchArticles();
}, [statusFilter]);

  // Filter articles based on search term and status
  const filteredArticles = Array.isArray(articles) ? articles.filter(article => {
  // ... your filter logic ...
  const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        article.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (Array.isArray(article.tags) && article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

  return matchesSearch;
}) : [];

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        const response = await kbService.deleteArticle(id);
        if (response.success) {
          toast.success('Article deleted successfully.');
          setArticles(prevArticles => prevArticles.filter(article => article._id !== id));
        } else {
          throw new Error(response.message || 'Failed to delete article');
        }
      } catch (err) {
        console.error('Delete article error:', err);
        const errorMsg = err.response?.data?.message || err.message || 'An error occurred while deleting the article.';
        toast.error(errorMsg);
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    return status === 'published' ? 'badge-success' : 'badge-warning';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Knowledge Base Articles</h1>
        <Link to="editor" className="btn btn-primary">
          <FaPlus /> New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0, display: 'flex', alignItems: 'center' }}>
            <FaSearch style={{ marginRight: '0.5rem' }} />
            <input
              type="text"
              placeholder="Search articles..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '250px' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="statusFilter" className="form-label" style={{ display: 'inline', marginRight: '0.5rem' }}>Status:</label>
            <select
              id="statusFilter"
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {loading && <div className="loading">Loading articles...</div>}
      {error && <div className="error">Error: {error}</div>}

      {!loading && !error && (
        <>
          {filteredArticles.length === 0 ? (
            <div className="card">
              <p>No articles found.</p>
              <Link to="editor" className="btn btn-primary">Create your first article</Link>
            </div>
          ) : (
            <div className="kb-list">
              {filteredArticles.map(article => (
                <div key={article._id} className="card" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem 0' }}>
                        {article.title}
                        {article.status === 'draft' && (
                          <span className="badge badge-warning" style={{ marginLeft: '0.5rem' }}>Draft</span>
                        )}
                      </h3>
                      <p style={{ margin: '0 0 0.5rem 0', color: '#6c757d' }}>
                        {article.body.substring(0, 150)}{article.body.length > 150 ? '...' : ''}
                      </p>
                      <div>
                        <span className={`badge ${getStatusBadgeClass(article.status)}`} style={{ marginRight: '1rem' }}>
                          {article.status}
                        </span>
                        <span>Tags: {article.tags.join(', ')}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                        Updated: {new Date(article.updatedAt).toLocaleDateString()}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`editor/${article._id}`} className="btn btn-secondary btn-sm" title="Edit">
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleDelete(article._id)}
                          className="btn btn-danger btn-sm"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default KBListPage;