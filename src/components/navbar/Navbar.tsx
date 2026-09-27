import React, { useState } from 'react';
import './navbar.css';
import logo from '../../assets/images/l2.png';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser } from '../../redux/user/userSlice';
import {
  Search,
  Menu,
  Close,
  Home,
  Build,
  VideoLibrary,
  Favorite,
  Person,
  ExitToApp,
  Login
} from '@mui/icons-material';

// via.placeholder.com no longer resolves, so the old fallback rendered a broken
// image icon for every user without a photo. Inline so it cannot fail.
const DEFAULT_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E" +
  "%3Ccircle cx='20' cy='20' r='20' fill='%23d1d5db'/%3E" +
  "%3Ccircle cx='20' cy='16' r='6.5' fill='%239ca3af'/%3E" +
  "%3Cpath d='M7 37c0-7 6-11 13-11s13 4 13 11z' fill='%239ca3af'/%3E%3C/svg%3E";

const Navbar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = useSelector((state: any) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    dispatch(clearUser());
    setIsSidebarOpen(false);
    navigate('/');
  };

  // About and Contact used to be here as "#about" and "#contact". No element
  // with either id exists anywhere in the app, so both links did nothing when
  // clicked. Contact is already served by the email in the footer.
  const navLinks = [
    { path: '/', label: 'Home', icon: <Home /> },
    { path: '/pricing', label: 'Pricing', icon: <Build /> },
    { path: '/videos', label: 'Videos', icon: <VideoLibrary /> },
    { path: '/wishlist', label: 'Wishlist', icon: <Favorite /> },
  ];

  return (
    <>
      <div className="navbar">
        <div className="hamburger" onClick={toggleSidebar}>
          <Menu />
        </div>
        <Link to="/" className="logo">
          <img src={logo} alt="Logo" className="logo-image" />
        </Link>
        <div className="nav-links">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="auth-section">
          {user ? (
            <>
              <div className="topbar-icons">
                {/* These were one <Link to="/userProfile"> wrapping all three, so
                    tapping the magnifier opened the profile page. The bell is gone:
                    there is no notifications feature to open. */}
                <Link to="/search/all" className="topbar-icon-link" aria-label="Search shops and products">
                  <Search />
                </Link>
                <Link to="/userProfile" className="topbar-icon-link" aria-label="Your profile">
                  <img
                    src={user.profilePic || DEFAULT_AVATAR}
                    alt=""
                    className="user-avatar-nav"
                  />
                </Link>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="login-btn">
              Login
            </Link>
          )}
        </div>
      </div>

      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-close" onClick={toggleSidebar}>
          <Close />
        </div>
        
        {user && (
          <div className="sidebar-user">
            <img 
              src={user.profilePic || DEFAULT_AVATAR}
              alt="User Avatar" 
              className="sidebar-avatar"
            />
            <div className="sidebar-user-info">
              <h3>{user.name || 'User'}</h3>
              <p>{user.email || 'user@example.com'}</p>
            </div>
          </div>
        )}

        <div className="sidebar-links">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} onClick={toggleSidebar}>
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        <div className="sidebar-auth">
          {user ? (
            <>
              <Link to="/userProfile" className="sidebar-profile-btn" onClick={toggleSidebar}>
                <Person />
                <span>Profile</span>
              </Link>
              <button className="sidebar-logout-btn" onClick={handleLogout}>
                <ExitToApp />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="sidebar-login-btn" onClick={toggleSidebar}>
              <Login />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>

      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
    </>
  );
};

export default Navbar;
