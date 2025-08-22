// src/pages/TicketListPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ticketService from '../services/ticketService';
import { FaPlus, FaFilter } from 'react-icons/fa';

const TicketListPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: '' }); // Example filter

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        // Pass filters to the service
        const response = await ticketService.getMyTickets(filters);
        if (response.success) {
          setTickets(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch tickets');
        }
      } catch (err) {
        console.error('Fetch tickets error:', err);
        const errorMsg = err.response?.data?.message || err.message || 'An error occurred while fetching tickets.';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [filters]); // Re-fetch if filters change

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'badge-open';
      case 'triaged':
        return 'badge-info';
      case 'waiting_human':
        return 'badge-warning';
      case 'resolved':
        return 'badge-success';
      case 'closed':
        return 'badge-secondary';
      default:
        return 'badge-default';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>My Tickets</h1>
        <Link to="/app/tickets/new" className="btn btn-primary">
          <FaPlus /> New Ticket
        </Link>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span><FaFilter /> Filter:</span>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="statusFilter" className="form-label" style={{ display: 'inline', marginRight: '0.5rem' }}>Status:</label>
            <select
              id="statusFilter"
              name="status"
              className="form-select"
              value={filters.status}
              onChange={handleFilterChange}
              style={{ width: 'auto' }}
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="triaged">Triaged</option>
              <option value="waiting_human">Waiting Human</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          {/* Add more filters as needed */}
        </div>
      </div>

      {loading && <div className="loading">Loading tickets...</div>}
      {error && <div className="error">Error: {error}</div>}

      {!loading && !error && (
        <>
          {tickets.length === 0 ? (
            <div className="card">
              <p>You have no tickets yet.</p>
              <Link to="/tickets/new" className="btn btn-primary">Create your first ticket</Link>
            </div>
          ) : (
            <div className="ticket-list">
              {tickets.map(ticket => (
                <div key={ticket._id} className="card" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem 0' }}>
                      <Link to={`/app/tickets/${ticket._id}`}>{ticket.title}</Link>
                    </h3>
                      <p style={{ margin: '0 0 0.5rem 0', color: '#6c757d' }}>
                        {ticket.description.substring(0, 100)}{ticket.description.length > 100 ? '...' : ''}
                      </p>
                      <div>
                        <span className={`badge ${getStatusBadgeClass(ticket.status)}`} style={{ marginRight: '1rem' }}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <span>Category: {ticket.category}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.9rem', color: '#6c757d' }}>
                      Created: {new Date(ticket.createdAt).toLocaleString()}
                      {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
                        <div>Updated: {new Date(ticket.updatedAt).toLocaleString()}</div>
                      )}
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

// Simple CSS for badges (can be moved to index.css)
const badgeStyles = `
  .badge {
    display: inline-block;
    padding: 0.25em 0.4em;
    font-size: 75%;
    font-weight: 700;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: 0.25rem;
  }
  .badge-open { background-color: #cce5ff; color: #004085; }
  .badge-info { background-color: #d1ecf1; color: #0c5460; }
  .badge-warning { background-color: #fff3cd; color: #856404; }
  .badge-success { background-color: #d4edda; color: #155724; }
  .badge-secondary { background-color: #e2e3e5; color: #383d41; }
  .badge-default { background-color: #f8f9fa; color: #333; }
`;

// Inject styles (better to add to index.css)
const styleSheet = document.createElement("style");
styleSheet.innerText = badgeStyles;
document.head.appendChild(styleSheet);

export default TicketListPage;