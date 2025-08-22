// src/pages/DashboardPage.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();

  // Simple greeting based on role
  let greeting = "Welcome!";
  let roleSpecificContent = null;

  if (user?.role === 'admin') {
    greeting = `Welcome, Administrator ${user.name}!`;
    roleSpecificContent = (
      <div className="card">
        <h2>Admin Dashboard</h2>
        <p>Use the navigation menu to manage the Knowledge Base and system configuration.</p>
        <ul>
          <li>Manage KB Articles</li>
          <li>View System Configuration</li>
          <li>Monitor overall system health (future feature)</li>
        </ul>
      </div>
    );
  } else if (user?.role === 'agent') {
    greeting = `Welcome, Support Agent ${user.name}!`;
    roleSpecificContent = (
      <div className="card">
        <h2>Agent Dashboard</h2>
        <p>Use the navigation menu to view tickets assigned to you or awaiting your review.</p>
        <ul>
          <li>Review tickets needing human attention</li>
          <li>Respond to user inquiries</li>
          <li>Resolve tickets</li>
        </ul>
      </div>
    );
  } else { // Default to user role
    greeting = `Welcome, ${user?.name}!`;
    roleSpecificContent = (
      <div className="card">
        <h2>User Dashboard</h2>
        <p>Use the navigation menu to create new support tickets or view the status of your existing ones.</p>
        <ul>
          <li>Create a new support ticket</li>
          <li>View your ticket history</li>
          <li>See responses from the support team</li>
        </ul>
      </div>
    );
  }

  return (
    <div>
      <h1>{greeting}</h1>
      <p>This is your Smart Helpdesk dashboard.</p>
      {roleSpecificContent}
    </div>
  );
};

export default DashboardPage;