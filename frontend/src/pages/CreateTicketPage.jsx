import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ticketService from '../services/ticketService';

const CreateTicketPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.warn('Title and description are required.');
      setIsLoading(false);
      return;
    }
    try {
      const response = await ticketService.createTicket(formData);
      if (response.success) {
        toast.success('Ticket created successfully!');
        navigate('/app/tickets');
      } else {
        throw new Error(response.message || 'Failed to create ticket');
      }
    } catch (err) {
      console.error('Create ticket error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'An error occurred while creating the ticket.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Create New Ticket</h1>
      <div className="card">
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
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">Description *</label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              rows="5"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="category" className="form-label">Category (Optional)</label>
            <select
              id="category"
              name="category"
              className="form-select"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="other">Other</option>
              <option value="billing">Billing</option>
              <option value="tech">Technical</option>
              <option value="shipping">Shipping</option>
            </select>
          </div>

          {/* Optional: Attachments input
          <div className="form-group">
            <label htmlFor="attachments" className="form-label">Attachment URLs (comma separated)</label>
            <input
              type="text"
              id="attachments"
              name="attachments"
              className="form-input"
              value={formData.attachments}
              onChange={handleChange}
              placeholder="e.g., http://example.com/log.txt, http://example.com/screenshot.png"
            />
          </div>
          */}

          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Ticket'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketPage;