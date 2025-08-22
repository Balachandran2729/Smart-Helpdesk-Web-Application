import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt, FaHome, FaTicketAlt, FaBook, FaCog, FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info('You have been logged out.');
    navigate('/');
  };

   return (
    <div className="main-layout">
      <header className="main-header">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
            <h1 style={{ margin: 0 }}>Smart Helpdesk</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span><FaUser /> {user?.name} ({user?.role})</span>
              <button onClick={handleLogout} className="btn btn-secondary" aria-label="Logout">
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container" style={{ display: 'flex', gap: '2rem', paddingTop: '1rem' }}>
        <nav className="sidebar">
          <ul>
            <li>
              <a href="/app/dashboard"><FaHome /> Dashboard</a>
            </li>
            {(user?.role === 'user' || user?.role === 'agent' || user?.role === 'admin') && (
              <li>
                <a href="/app/tickets"><FaTicketAlt /> My Tickets</a>
              </li>
            )}
            {user?.role === 'admin' && (
              <>
                <li>
                  <a href="/app/kb"><FaBook /> Knowledge Base</a>
                </li>
                <li>
                  <a href="/app/config"><FaCog /> Configuration</a>
                </li>
              </>
            )}
          </ul>
        </nav>
        <main className="main-content" style={{ flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;