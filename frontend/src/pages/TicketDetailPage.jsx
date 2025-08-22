// src/pages/TicketDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ticketService from '../services/ticketService';
import api from '../services/api'; // Import api instance for audit logs
import {
  FaArrowLeft,
  FaHistory,
  FaRobot,
  FaUser,
  FaClock,
  FaTag,
  FaInfoCircle,
  FaPaperPlane,
  FaLockOpen,
  FaLock,
  FaEdit,
  FaTimes,
} from 'react-icons/fa';

const TicketDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [agentSuggestion, setAgentSuggestion] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  // --- Agent State ---
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [editedDraft, setEditedDraft] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    const fetchTicketData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        // Fetch ticket and populate agent suggestion in one call if backend supports it
        // Otherwise, fetch separately
        const response = await ticketService.getTicketById(id);
        if (response.success) {
          setTicket(response.ticket);
          // If the ticket object includes the populated agentSuggestion, use it.
          if (response.ticket.agentSuggestionId && response.ticket.agentSuggestion) {
            setAgentSuggestion(response.ticket.agentSuggestion);
            setEditedDraft(response.ticket.agentSuggestion.draftReply || ''); // Initialize draft for editing
          }
        } else {
          throw new Error(response.message || 'Failed to fetch ticket');
        }
      } catch (err) {
        console.error('Fetch ticket error:', err);
        const errorMsg = err.response?.data?.message || err.message || 'An error occurred while fetching the ticket.';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketData();
  }, [id]);

  // Fetch Agent Suggestion if ticket has one and it wasn't populated
  useEffect(() => {
    const fetchAgentSuggestion = async () => {
      if (ticket?.agentSuggestionId && !agentSuggestion) {
        setLoadingSuggestion(true);
        try {
          // Assuming you have an endpoint like /api/agent/suggestion/:ticketId
          // Or you could fetch it via a service function that calls the API
          const suggestionResponse = await api.get(`/agent/suggestion/${ticket._id}`);
          if (suggestionResponse.data.success) {
            setAgentSuggestion(suggestionResponse.data.data);
            setEditedDraft(suggestionResponse.data.data.draftReply || ''); // Initialize draft for editing
          }
        } catch (err) {
          console.error('Fetch agent suggestion error:', err);
          // Don't toast error here, as suggestion might not exist or user might not have access yet
        } finally {
          setLoadingSuggestion(false);
        }
      }
    };

    fetchAgentSuggestion();
  }, [ticket?.agentSuggestionId, agentSuggestion, ticket?._id]);

  // Fetch Audit Logs
  useEffect(() => {
  const fetchAuditLogs = async () => {
    if (id) {
      setLoadingLogs(true);
      try {
        const logsResponse = await api.get(`/tickets/${id}/audit`);
        // console.log("TicketDetailPage: Raw audit log API response:", logsResponse); // --- ADD THIS LOG ---
        if (logsResponse.data && logsResponse.data.success) {
          // --- Robustly find the array ---
          let logsArray = [];
          // Check common locations for the logs array
          if (Array.isArray(logsResponse.data.logs)) {
            logsArray = logsResponse.data.logs;
          } else if (Array.isArray(logsResponse.data.data)) {
            logsArray = logsResponse.data.data;
          } else if (Array.isArray(logsResponse.data)) {
            logsArray = logsResponse.data; // If array is returned directly
          } else {
            // If logs property exists but is not an array
            if (logsResponse.data.logs !== undefined) {
              console.warn("TicketDetailPage: Expected logsResponse.data.logs to be an array, got:", logsResponse.data.logs);
            } else {
              console.warn("TicketDetailPage: Audit log response does not contain a 'logs' or 'data' array property:", logsResponse.data);
            }
            // Fallback to empty array
            logsArray = [];
          }
          // console.log("TicketDetailPage: Parsed audit logs array:", logsArray); // --- ADD THIS LOG ---
          setAuditLogs(logsArray);
        } else {
          console.error('TicketDetailPage: Failed to fetch audit logs or unexpected structure:', logsResponse.data);
          setAuditLogs([]); // Fallback
        }
      } catch (err) {
        console.error('TicketDetailPage: Fetch audit logs error:', err);
        setAuditLogs([]); // Set to empty array on error
      } finally {
        setLoadingLogs(false);
      }
    }
  };

  fetchAuditLogs();
}, [id]);

  // --- Agent Functions ---
  const handleAcceptAndSend = async () => {
    if (!agentSuggestion?.draftReply) {
      toast.warn('No draft reply available to send.');
      return;
    }
    await handleSendReply(agentSuggestion.draftReply);
  };

  const handleEditAndSend = async () => {
    if (!editedDraft.trim()) {
      toast.warn('Draft reply cannot be empty.');
      return;
    }
    await handleSendReply(editedDraft);
  };

  const handleSendReply = async (replyContent) => {
    if (!replyContent.trim()) return;

    setSendingReply(true);
    try {
      const replyResponse = await ticketService.addReply(id, { content: replyContent });
      if (!replyResponse.success) {
        throw new Error(replyResponse.message || 'Failed to send reply');
      }
      const updatedTicketResponse = await ticketService.getTicketById(id);
      if (updatedTicketResponse.success) {
        setTicket(updatedTicketResponse.ticket);
        setIsEditingDraft(false);
        setEditedDraft(replyContent); 
        toast.success('Reply sent and ticket resolved successfully!');
      } else {
        throw new Error(updatedTicketResponse.message || 'Failed to refresh ticket data');
      }
    } catch (err) {
      console.error('Send reply error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'An error occurred while sending the reply.';
      toast.error(errorMsg);
    } finally {
      setSendingReply(false);
    }
  };

  const handleReopenTicket = async () => {
    try {
      const response = await ticketService.updateTicketStatus(id, { status: 'open' });
      if (response.success) {
        // Refresh ticket data
        const updatedTicketResponse = await ticketService.getTicketById(id);
        if (updatedTicketResponse.success) {
          setTicket(updatedTicketResponse.ticket);
          toast.success('Ticket reopened successfully.');
        }
      } else {
        throw new Error(response.message || 'Failed to reopen ticket');
      }
    } catch (err) {
      console.error('Reopen ticket error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'An error occurred while reopening the ticket.';
      toast.error(errorMsg);
    }
  };

  const handleEditDraftChange = (e) => {
    setEditedDraft(e.target.value);
  };

  // Function to format action descriptions (optional)
  const formatActionDescription = (action, meta) => {
    switch (action) {
      case 'TICKET_CREATED':
        return 'Ticket was created by user.';
      case 'AGENT_CLASSIFIED':
        return `Agent classified ticket as '${meta.predictedCategory}' with confidence ${meta.confidence?.toFixed(2) || 'N/A'}.`;
      case 'KB_RETRIEVED':
        return `Agent retrieved ${meta.count || 0} relevant KB articles.`;
      case 'DRAFT_GENERATED':
        // Truncate draft for display
        const draftPreview = meta.draftReply
          ? meta.draftReply.substring(0, 50) + (meta.draftReply.length > 50 ? '...' : '')
          : 'No draft content.';
        return `Agent generated draft reply: "${draftPreview}"`;
      case 'AUTO_CLOSED':
        return 'Ticket was automatically resolved by the agent based on high confidence.';
      case 'ASSIGNED_TO_HUMAN':
        return 'Ticket requires human review and has been assigned.';
      case 'TRIAGE_COMPLETED':
        return `Agent triage process completed. Final status: ${meta.finalStatus || 'N/A'}. Auto-closed: ${
          meta.autoClosed ? 'Yes' : 'No'
        }.`;
      case 'STATUS_CHANGED':
        return `Ticket status changed from '${meta.from || 'N/A'}' to '${meta.to || 'N/A'}'.`;
      case 'REPLY_SENT': // If your backend logs this
         return `Reply sent by ${meta.sentBy || 'agent/user'}.`;
      // Add more cases as needed
      default:
        return action; // Fallback to just the action name
    }
  };

  // Function to get actor icon
  const getActorIcon = (actor) => {
    switch (actor) {
      case 'system':
        return <FaInfoCircle />;
      case 'agent':
        return <FaRobot />;
      case 'user':
        return <FaUser />;
      default:
        return <FaUser />; // Default icon
    }
  };

  if (loading) return <div className="loading">Loading ticket details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!ticket) return <div className="error">Ticket not found.</div>;

  // Determine if current user is an agent and ticket is assigned to them or waiting for review
  const isAgent = user?.role === 'agent' || user?.role === 'admin';
  const canAgentAct = isAgent && ticket.status === 'waiting_human';
  const canAgentReopen = isAgent && (ticket.status === 'resolved' || ticket.status === 'closed');

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/app/tickets" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaArrowLeft /> Back to Tickets
        </Link>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0' }}>{ticket.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#6c757d', fontSize: '0.9rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <FaTag /> {ticket.category}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <FaClock /> Created: {new Date(ticket.createdAt).toLocaleString()}
              </span>
              {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <FaClock /> Updated: {new Date(ticket.updatedAt).toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <span
            className={`badge ${
              ticket.status === 'open'
                ? 'badge-open'
                : ticket.status === 'triaged'
                ? 'badge-info'
                : ticket.status === 'waiting_human'
                ? 'badge-warning'
                : ticket.status === 'resolved'
                ? 'badge-success'
                : ticket.status === 'closed'
                ? 'badge-secondary'
                : 'badge-default'
            }`}
          >
            {ticket.status.replace('_', ' ')}
          </span>
        </div>

        <div className="form-group">
          <label className="form-label">
            <strong>Description:</strong>
          </label>
          <div
            className="form-textarea"
            style={{ minHeight: '100px', backgroundColor: '#f8f9fa', padding: '10px', border: '1px solid #ced4da' }}
          >
            {ticket.description}
          </div>
        </div>

        {/* Agent Suggestion Section */}
        {isAgent && agentSuggestion && (
          <div className="card" style={{ marginTop: '1rem', borderLeft: '4px solid #007bff' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0' }}>
              <FaRobot /> Agent Suggestion
              {loadingSuggestion && (
                <span className="loading-spinner" style={{ width: '20px', height: '20px', marginLeft: '0.5rem' }}></span>
              )}
            </h3>

            {agentSuggestion ? (
              <div>
                <div className="form-group">
                  <label className="form-label">
                    <strong>Predicted Category:</strong>
                  </label>
                  <p>{agentSuggestion.predictedCategory}</p>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <strong>Confidence:</strong>
                  </label>
                  <p>{(agentSuggestion.confidence * 100).toFixed(1)}%</p>
                </div>

                {/* Draft Reply Display/Edit */}
                <div className="form-group">
                  <label className="form-label">
                    <strong>Draft Reply:</strong>
                  </label>
                  {isEditingDraft ? (
                    <div>
                      <textarea
                        className="form-textarea"
                        rows="6"
                        value={editedDraft}
                        onChange={handleEditDraftChange}
                        disabled={sendingReply}
                      />
                      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={handleEditAndSend}
                          disabled={sendingReply}
                        >
                          {sendingReply ? 'Sending...' : <><FaPaperPlane /> Send Edited</>}
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setIsEditingDraft(false)}
                          disabled={sendingReply}
                        >
                          <FaTimes /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div
                        className="form-textarea"
                        style={{ minHeight: '100px', backgroundColor: '#f8f9fa', padding: '10px', border: '1px solid #ced4da' }}
                      >
                        {agentSuggestion.draftReply}
                      </div>
                      {canAgentAct && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setIsEditingDraft(true)}
                          disabled={sendingReply}
                          style={{ marginTop: '0.5rem' }}
                        >
                          <FaEdit /> Edit Draft
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <strong>Auto-Closed:</strong>
                  </label>
                  <p>{agentSuggestion.autoClosed ? 'Yes' : 'No'}</p>
                </div>
{agentSuggestion && Array.isArray(agentSuggestion.articleIds) && agentSuggestion.articleIds.length > 0 && (
  <div className="form-group">
    <label className="form-label"><strong>Retrieved KB Articles:</strong></label>
    <ul>
      {agentSuggestion.articleIds.map((article, index) => {
        // --- Check if article is an object or a string ID ---
        const articleId = typeof article === 'string' ? article : article?._id;
        const articleTitle = typeof article === 'string' ? `ID: ${article}` : article?.title || `ID: ${article?._id || 'Unknown'}`;

        return (
          <li key={articleId || index}>
            {/* Render the title or ID */}
            <span>{articleTitle}</span>
            {/* Optionally, render the ID in <code> if it's distinct info */}
            {articleId && articleTitle !== `ID: ${articleId}` && (
              <> (<code>{articleId}</code>)</>
            )}
          </li>
        );
      })}
    </ul>
  </div>
)}
              </div>
            ) : (
              <p>{loadingSuggestion ? 'Loading suggestion...' : 'No agent suggestion available yet or ticket is not processed.'}</p>
            )}
          </div>
        )}

        {/* Agent Actions */}
        {canAgentAct && !isEditingDraft && (
          <div className="card" style={{ marginTop: '1rem', backgroundColor: '#e7f3ff' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Agent Actions</h3>
            <div>
              <button
                className="btn btn-primary"
                onClick={handleAcceptAndSend}
                disabled={sendingReply}
                style={{ marginRight: '0.5rem' }}
              >
                {sendingReply ? 'Sending...' : <><FaPaperPlane /> Accept & Send Draft</>}
              </button>
              {/* Edit Draft button moved inside the suggestion section above */}
            </div>
          </div>
        )}

        {/* Agent Reopen Action */}
        {canAgentReopen && (
          <div className="card" style={{ marginTop: '1rem' }}>
            <button className="btn btn-warning" onClick={handleReopenTicket}>
              <FaLockOpen /> Reopen Ticket
            </button>
          </div>
        )}

        {/* Audit Log Section */}
        <div className="card" style={{ marginTop: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0' }}>
            <FaHistory /> Audit Timeline
            {loadingLogs && (
              <span className="loading-spinner" style={{ width: '20px', height: '20px', marginLeft: '0.5rem' }}></span>
            )}
          </h3>

          {auditLogs.length > 0 ? (
            <div style={{ position: 'relative', paddingLeft: '20px' }}>
              <div
                style={{ position: 'absolute', left: '30px', top: 0, bottom: 0, width: '2px', backgroundColor: '#dee2e6' }}
              ></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {auditLogs.map((log, index) => (
                  <li key={log._id} style={{ marginBottom: '1rem', position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: '-28px',
                        top: '10px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: '#007bff',
                        border: '2px solid white',
                        zIndex: 1,
                      }}
                    ></div>
                    <div className="card" style={{ marginLeft: '20px', marginBottom: 0, padding: '1rem' }}>
                      <div
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {getActorIcon(log.actor)} <strong>{log.actor}</strong>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                      <p style={{ margin: '0.25rem 0' }}>
                        <strong>Action:</strong> {log.action}
                      </p>
                      <p style={{ margin: '0.25rem 0' }}>
                        <strong>Description:</strong> {formatActionDescription(log.action, log.meta)}
                      </p>
                      {log.traceId && (
                        <p style={{ margin: '0.25rem 0', fontSize: '0.8rem' }}>
                          <strong>Trace ID:</strong> <code>{log.traceId}</code>
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>{loadingLogs ? 'Loading audit log...' : 'No audit log entries found for this ticket.'}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;