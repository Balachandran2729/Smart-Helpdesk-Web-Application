# Smart Helpdesk with Agentic Triage

This is a full-stack web application built as part of the Wexa AI Fresher Assignment. It simulates a smart helpdesk where users can create support tickets. An agentic workflow, running within the Node.js backend, automatically processes these tickets by classifying them, retrieving relevant knowledge base (KB) articles, drafting a reply, and either auto-resolving the ticket or assigning it to a human agent for review.

## Features

*   **User Roles:** Distinct experiences for End Users, Support Agents, and Admins.
*   **Ticket Lifecycle:** Users create tickets; the system automatically triages them.
*   **Agentic Workflow (Stubbed):** Backend Node.js process handles ticket classification, KB retrieval, draft reply generation, and decision-making (auto-close or human assignment) using deterministic rules (no external LLM API keys needed).
*   **Audit Trail:** A detailed log tracks every step of the ticket's journey with a unique `traceId`.
*   **Knowledge Base Management:** Admins can create, edit, publish, and unpublish help articles.
*   **Agent Review:** Agents can view tickets assigned to them, review AI suggestions, edit drafts, and send final replies.
*   **System Configuration:** Admins can adjust agent behavior (e.g., auto-close toggle, confidence threshold).

## Technologies Used

*   **Frontend:** React 18, Vite, React Router v6, Axios, React Toastify, React Icons
*   **Backend:** Node.js 20+, Express.js, Mongoose (MongoDB ODM)
*   **Database:** MongoDB
*   **Authentication:** JWT (JSON Web Tokens)
*   **DevOps:** Docker, Docker Compose
*   **Testing:** Jest (Backend)
*   **Styling:** Vanilla CSS

## Prerequisites

*   Docker and Docker Compose installed on your machine.
*   Git (to clone the repository).

## To run the Project

*   Frontend : Run - npm run dev - in Frontend Folder 
*   Backend : In parent folder run - docker-compose up

## Getting Started

These instructions will get you a copy of the project up and running on your local machine.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <your-project-directory-name>