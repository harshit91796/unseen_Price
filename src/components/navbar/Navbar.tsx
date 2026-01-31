import React, { useState } from 'react';
import './navbar.css';
import logo from '../../assets/images/l2.png';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser } from '../../redux/user/userSlice';
import { 
  Search, 
  Notifications, 
  Menu, 
  Close,
  Home,
  Info,
  Build,
  VideoLibrary,
  Favorite,
  ContactMail,
  Person,
  ExitToApp,
  Login
} from '@mui/icons-material';

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

  const handleProfileClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      navigate('/login');
    }
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: <Home /> },
    { path: '#about', label: 'About', icon: <Info /> },
    { path: '/pricing', label: 'Pricing', icon: <Build /> },
    { path: '/videos', label: 'Videos', icon: <VideoLibrary /> },
    { path: '/wishlist', label: 'Wishlist', icon: <Favorite /> },
    { path: '#contact', label: 'Contact', icon: <ContactMail /> },
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
              <Link to="/userProfile" onClick={handleProfileClick}>
                <div className="topbar-icons">
                  <Search />
                  <Notifications />
                  <img 
                    src={user.profilePic || "https://via.placeholder.com/50"}
                    alt="User Avatar" 
                    className="user-avatar-nav"
                  />
                </div>
              </Link>
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
              src={user.profilePic || "https://via.placeholder.com/50"}
              alt="User Avatar" 
              className="sidebar-avatar"
            />
            <div className="sidebar-user-info">
              <h3>{user.username || 'User'}</h3>
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
              <Link to="/userProfile" className="sidebar-profile-btn" onClick={() => {
                handleProfileClick;
                toggleSidebar();
              }}>
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
