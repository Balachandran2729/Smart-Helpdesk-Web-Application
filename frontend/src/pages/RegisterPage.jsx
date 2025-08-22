// src/pages/RegisterPage.jsx
import  { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user', // Add role with default value
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Basic client-side validation
      if (!formData.name || !formData.email || !formData.password) {
         toast.warn('Please fill in all fields.');
         setIsLoading(false);
         return;
      }
      if (formData.password.length < 6) {
         toast.warn('Password must be at least 6 characters.');
         setIsLoading(false);
         return;
      }
      // Optional: Validate role is one of the allowed values
      const validRoles = ['user', 'agent', 'admin'];
      if (!validRoles.includes(formData.role)) {
         toast.warn('Please select a valid role.');
         setIsLoading(false);
         return;
      }
      const result = await register(formData);
      if (result.success) {
        toast.success(`Registration successful as ${formData.role}! You are now logged in.`);
        navigate('/');
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.');
      console.error('Register component error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
        <div className="card-header">Register</div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          {/* --- Role Selection Added --- */}
          <div className="form-group">
            <label htmlFor="role" className="form-label">Role:</label>
            <select
              id="role"
              name="role"
              className="form-select" // Use form-select class for styling
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="user">User (Create Tickets)</option>
              <option value="agent">Agent (Review Tickets)</option>
              <option value="admin">Admin (Manage KB & Config)</option>
            </select>
          </div>
          {/* --- End Role Selection --- */}
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p style={{ marginTop: '1rem' }}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;