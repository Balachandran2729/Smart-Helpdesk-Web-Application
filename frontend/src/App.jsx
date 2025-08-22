// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import TicketListPage from './pages/TicketListPage';
import CreateTicketPage from './pages/CreateTicketPage';
import TicketDetailPage from './pages/TicketDetailPage';
import ConfigPage from './pages/ConfigPage';
// --- Import new KB pages ---
import KBListPage from './pages/KBListPage';
import KBEditorPage from './pages/KBEditorPage';
// --- Import ProtectedRoute for role-based access ---
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes using MainLayout */}
              <Route path="/app" element={<MainLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                {/* Ticket Routes */}
                <Route path="tickets" element={<TicketListPage />} />
                <Route path="tickets/new" element={<CreateTicketPage />} />
                <Route path="tickets/:id" element={<TicketDetailPage />} />

                {/* KB Routes - Admin Only */}
                <Route
                  path="kb"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <KBListPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="kb/editor"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <KBEditorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="kb/editor/:id"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <KBEditorPage />
                    </ProtectedRoute>
                  }
                />

                {/* Configuration Route - Admin Only */}
                <Route
                  path="config"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <ConfigPage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all for undefined paths within the /app layout */}
                <Route path="*" element={<div className="card"><h2>Page Not Found</h2><p>The page you are looking for does not exist within the app.</p></div>} />
              </Route>

              {/* Global catch-all for any other undefined routes */}
              <Route path="*" element={<div className="container"><h2>Page Not Found</h2><p>The page you are looking for does not exist.</p></div>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;