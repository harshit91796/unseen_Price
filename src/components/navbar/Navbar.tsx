import React, { useState } from 'react';
import './navbar.css';
import logo from '../../assets/images/l2.png';

const Navbar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <div className="topbar">
      <div className="hamburger" onClick={toggleSidebar}>
          ☰
        </div>
        <div className="logo">
          <img src={logo} alt="Logo" className="logo-image" />
        </div>
        <div className="nav-links">
          <a href="/">Home</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="/videos">Videos</a>
          <a href="/wishlist">Wishlist</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="topbar-icons">
          <i className="fas fa-search"></i>
          <i className="fas fa-bell"></i>
          <img src="https://via.placeholder.com/50" alt="User Avatar" className="user-avatar" />
        </div>
        
      </div>

      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-close" onClick={toggleSidebar}>
          ×
        </div>
        <div className="sidebar-links">
          <a href="/">Home</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="/videos">Videos</a>
          <a href="/wishlist">Wishlist</a>
          <a href="#contact">Contact</a>
        </div>
      </div>
    </>
  );
};

export default Navbar;
