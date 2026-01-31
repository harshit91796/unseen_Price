import React from 'react';
import { Outlet } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';

const AuthenticatedLayout: React.FC = () => {
  return (
    <div className="authenticated-layout">
      <DarkModeToggle />
      <Outlet />
    </div>
  );
};

export default AuthenticatedLayout;
