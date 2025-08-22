// src/services/ticketService.js
import api from './api';

const createTicket = async (ticketData) => {
  const response = await api.post('/tickets', ticketData);
  return response.data; // { success: true, ticket }
};

const getMyTickets = async (filters = {}) => {
  let queryString = '';
  if (Object.keys(filters).length > 0) {
    const params = new URLSearchParams(filters);
    queryString = `?${params.toString()}`;
  }
  const response = await api.get(`/tickets${queryString}`);
  return response.data; // { success: true, count, data: tickets[] }
};

// Ensure this function is present and correctly implemented
const getTicketById = async (id) => {
  const response = await api.get(`/tickets/${id}`);
  return response.data; // { success: true, ticket }
};

// Add reply function (for agents)
const addReply = async (ticketId, replyData) => {
    try {
        const response = await api.post(`/tickets/${ticketId}/reply`, replyData);
        return response.data;
    } catch (error) {
        console.error('ticketService: Error adding reply:', error);
        throw error;
    }
};

// Update ticket status (e.g., for resolving, closing, reopening)
const updateTicketStatus = async (ticketId, statusData) => {
    try {
        const response = await api.put(`/tickets/${ticketId}/status`, statusData);
        return response.data;
    } catch (error) {
        console.error('ticketService: Error updating ticket status:', error);
        throw error;
    }
};

const ticketService = {
  createTicket,
  getMyTickets,
  getTicketById,
  addReply,
  updateTicketStatus,
};

export default ticketService;