import  { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import kbService from '../services/kbService';
import { FaArrowLeft } from 'react-icons/fa';

const KBEditorPage = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    tags: '',
    status: 'draft',
  });
  const [loading, setLoading] = useState(false); 
  const [fetching, setFetching] = useState(isEditing); 
  const [error, setError] = useState(null); 
  const fetchArticle = async () => {
  if (isEditing) {
    setFetching(true);
    setError(null);
    try {
      const article = await kbService.getArticleById(id); 
      console.log("KBEditorPage: Fetched article data:", article); 
      if (!article || typeof article !== 'object') {
        throw new Error('Invalid article data received.');
      }
      setFormData({
        title: article.title || '',
        body: article.body || '',
        tags: Array.isArray(article.tags) ? article.tags.join(', ') : '',
        status: article.status || 'draft',
      });
    } catch (err) {
      console.error('KBEditorPage: Fetch article error:', err);
      let errorMsg = 'An unknown error occurred.';
      if (err.response) {
        errorMsg = err.response.data?.message || `Server error (${err.response.status})`;
      } else if (err.request) {
        // Network error (less likely)
        errorMsg = 'Network error. Please check your connection.';
      } else {
        // Error thrown by our logic or the service
        errorMsg = err.message || 'Failed to load article.';
      }
      // --- End improved error message extraction ---
      setError(errorMsg);
      toast.error(`Failed to load article: ${errorMsg}`);
      // Optionally, navigate away or show a more prominent error UI
    } finally {
      setFetching(false);
    }
  }
  // If not editing, fetching remains false, and initial formData is used
};
  useEffect(() => {
    fetchArticle();
  }, [id, isEditing]); // Dependencies

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null); // Clear previous submit errors

  if (!formData.title.trim() || !formData.body.trim()) {
    toast.warn('Title and body are required.');
    setLoading(false);
    return;
  }

  try {
    const dataToSubmit = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
    };

    // console.log("KBEditorPage: Submitting article data:", dataToSubmit); // <-- Log data being sent

    let response;
    if (isEditing) {
      // console.log("KBEditorPage: Calling kbService.updateArticle with ID:", id); // <-- Log
      response = await kbService.updateArticle(id, dataToSubmit);
      toast.success('Article updated successfully!');
    } else {
      // console.log("KBEditorPage: Calling kbService.createArticle"); // <-- Log
      response = await kbService.createArticle(dataToSubmit);
      // console.log("KBEditorPage: kbService.createArticle response:", response); // <-- Log raw response
      toast.success('Article created successfully!');
    }

    // Check if response indicates success (based on your service logic)
    // If your service throws on error, this part might not be reached.
    // But if it returns data even on backend success=false, check here.
    // if (response.success) { // If your service returns the full response object
    //   navigate('/app/kb');
    // } else {
    //   throw new Error(response.message || `Failed to ${isEditing ? 'update' : 'create'} article`);
    // }
    // Assuming service throws on error, navigate directly after successful call
    navigate('/app/kb');

  } catch (err) {
    console.error(`KBEditorPage: ${isEditing ? 'Update' : 'Create'} article error:`, err); 
    let errorMsg = 'An unknown error occurred.';
    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('KBEditorPage: Error response data:', err.response.data);
      console.error('KBEditorPage: Error response status:', err.response.status);
      console.error('KBEditorPage: Error response headers:', err.response.headers);
      errorMsg = err.response.data?.message || `Server error (${err.response.status})`;
    } else if (err.request) {
      // The request was made but no response was received
      console.error('KBEditorPage: Error request:', err.request);
      errorMsg = 'Network error. Please check your connection.';
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('KBEditorPage: Error message:', err.message);
      errorMsg = err.message || 'An unexpected error occurred.';
    }
    // --- End improved error message extraction ---
    setError(errorMsg); // Set error state for UI display (optional)
    toast.error(`Failed to ${isEditing ? 'update' : 'create'} article: ${errorMsg}`); // Show detailed error in toast
  } finally {
    setLoading(false);
  }
};

  // --- Improved rendering based on state ---
  if (fetching) {
    return <div className="loading">Loading article...</div>;
  }

  if (error && isEditing) { // Show error message if fetching failed during edit
    return (
      <div>
         <div style={{ marginBottom: '1rem' }}>
          <Link to="/app/kb" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaArrowLeft /> Back to KB
          </Link>
        </div>
        <div className="error card"> {/* Add card for styling */}
          <h2>Error Loading Article</h2>
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={() => navigate('/app/kb')}>Go Back to KB List</button>
        </div>
      </div>
    );
  }

  // If not fetching and no error (or not editing), render the form
  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/app/kb" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaArrowLeft /> Back to KB
        </Link>
      </div>

      <div className="card">
        <h1>{isEditing ? 'Edit Article' : 'Create New Article'}</h1>
        {/* Show submit error if any */}
        {error && !fetching && <div className="error" style={{ marginBottom: '1rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title" className="form-label">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              required
              disabled={fetching} 
            />
          </div>

          <div className="form-group">
            <label htmlFor="body" className="form-label">Body *</label>
            <textarea
              id="body"
              name="body"
              className="form-textarea"
              rows="10"
              value={formData.body} 
              onChange={handleChange}
              required
              disabled={fetching} 
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="tags" className="form-label">Tags (comma separated)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              className="form-input"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., billing, payments, account"
              disabled={fetching} 
            />
          </div>

          <div className="form-group">
            <label htmlFor="status" className="form-label">Status</label>
            <select
              id="status"
              name="status"
              className="form-select"
              value={formData.status}
              onChange={handleChange}
              disabled={fetching} 
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading || fetching}> {/* Disable submit while loading or fetching */}
            {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Article' : 'Create Article')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default KBEditorPage;