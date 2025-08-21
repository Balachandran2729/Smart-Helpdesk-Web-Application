// src/services/agent.service.js
const Ticket = require('../models/Ticket');
const Article = require('../models/Article');
const AgentSuggestion = require('../models/AgentSuggestion');
const Config = require('../models/Config');
const auditService = require('./audit.service');
const { classifyStub, draftStub, retrieveKBStub } = require('../utils/llmStub');
const ticketService = require('./ticket.service'); // To update ticket status
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

// --- Core Agentic Workflow Logic ---

/**
 * Main function to process a ticket through the agentic triage workflow.
 * @param {mongoose.Types.ObjectId} ticketId - The ID of the ticket to process.
 */
const processTicket = async (ticketId) => {
  const traceId = uuidv4(); // Generate a unique trace ID for this workflow instance
  logger.info('Starting Agent Triage Process', { ticketId, traceId });

  try {
    // --- 1. Plan ---
    // The plan is hardcoded: Classify -> Retrieve -> Draft -> Decide
    await auditService.logEvent(ticketId, 'agent', 'PLAN_CREATED', { steps: ['CLASSIFY', 'RETRIEVE', 'DRAFT', 'DECIDE'] }, traceId);

    // --- 2. Fetch Ticket ---
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new Error(`Ticket with ID ${ticketId} not found.`);
    }

    const ticketText = `${ticket.title} ${ticket.description}`;

    // --- 3. Classify ---
    await auditService.logEvent(ticketId, 'agent', 'CLASSIFICATION_STARTED', {}, traceId);
    const classificationResult = classifyStub(ticketText);
    await auditService.logEvent(ticketId, 'agent', 'AGENT_CLASSIFIED', classificationResult, traceId);
    logger.debug('Classification completed', { ticketId, ...classificationResult });

    // --- 4. Retrieve KB ---
    await auditService.logEvent(ticketId, 'agent', 'KB_RETRIEVAL_STARTED', {}, traceId);
    const retrievedResults = await retrieveKBStub(ticketText);
    const topArticleIds = retrievedResults.map(r => r.article._id);
    const topArticles = retrievedResults.map(r => r.article); // Full article objects for drafting
    await auditService.logEvent(ticketId, 'agent', 'KB_RETRIEVED', { articleIds: topArticleIds, count: topArticleIds.length }, traceId);
    logger.debug('KB Retrieval completed', { ticketId, articleCount: topArticleIds.length });

    // --- 5. Draft Reply ---
    await auditService.logEvent(ticketId, 'agent', 'DRAFTING_STARTED', {}, traceId);
    const draftResult = draftStub(ticketText, topArticles);
    await auditService.logEvent(ticketId, 'agent', 'DRAFT_GENERATED', draftResult, traceId);
    logger.debug('Draft generation completed', { ticketId, replyLength: draftResult.draftReply.length });

    // --- 6. Get Config ---
    const config = await Config.getConfig();
    logger.debug('Config fetched', { autoCloseEnabled: config.autoCloseEnabled, threshold: config.confidenceThreshold });

    // --- 7. Decision & Persist ---
    const { predictedCategory, confidence } = classificationResult;
    const { draftReply } = draftResult;

    // Create the AgentSuggestion document
    const suggestionData = {
      ticketId: ticket._id,
      predictedCategory,
      articleIds: topArticleIds,
      draftReply,
      confidence,
      modelInfo: {
        provider: process.env.STUB_MODE === 'true' ? 'stub' : 'openai', // Example
        model: process.env.STUB_MODE === 'true' ? 'keyword-matcher-v1' : 'gpt-3.5-turbo', // Example
        promptVersion: '1.0.0', // Example
        latencyMs: Math.floor(Math.random() * 50) + 10 // Simulate latency for stub
      }
    };

    const agentSuggestion = new AgentSuggestion(suggestionData);
    await agentSuggestion.save();
    logger.info('Agent Suggestion saved', { suggestionId: agentSuggestion._id, ticketId });

    // Update ticket with suggestion ID
    ticket.agentSuggestionId = agentSuggestion._id;
    ticket.category = predictedCategory; // Update ticket category based on agent
    // Status will be updated based on decision

    let finalStatus = 'triaged'; // Default
    let autoClosed = false;

    // --- Decision Logic ---
    if (config.autoCloseEnabled && confidence >= config.confidenceThreshold) {
      // Auto-close
      finalStatus = 'resolved';
      autoClosed = true;
      agentSuggestion.autoClosed = true;
      await agentSuggestion.save(); // Save the autoClosed flag

      // Simulate sending the reply (in a real app, you'd store it or send an email)
      await auditService.logEvent(ticketId, 'agent', 'AUTO_CLOSED', { message: 'Ticket auto-resolved based on high confidence suggestion.' }, traceId);
      logger.info('Ticket auto-closed', { ticketId, confidence, threshold: config.confidenceThreshold });
      
    } else {
      // Assign to human
      finalStatus = 'waiting_human';
      // In a real app, you might assign to a specific agent or queue
      // For now, we just set the status
      await auditService.logEvent(ticketId, 'agent', 'ASSIGNED_TO_HUMAN', { message: 'Ticket requires human review due to low confidence or auto-close disabled.' }, traceId);
      logger.info('Ticket assigned to human', { ticketId, confidence, threshold: config.confidenceThreshold, autoCloseEnabled: config.autoCloseEnabled });
    }

    ticket.status = finalStatus;
    await ticket.save();
    logger.info('Ticket status updated after triage', { ticketId, status: finalStatus });

    await auditService.logEvent(ticketId, 'agent', 'TRIAGE_COMPLETED', { finalStatus, autoClosed }, traceId);
    
  } catch (error) {
    logger.error('Agent Triage Process Failed', { ticketId, traceId, error: error.message, stack: error.stack });
    // Log the failure in the audit trail
    await auditService.logEvent(ticketId, 'system', 'TRIAGE_FAILED', { error: error.message }, traceId);
    // Depending on requirements, you might want to re-throw or handle differently
    throw error; // Re-throw to be caught by the caller (e.g., in ticket.service)
  }
};

module.exports = { processTicket };