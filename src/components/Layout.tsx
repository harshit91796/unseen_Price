import React from 'react';
import { useAppSelector } from '../redux/hooks/hooks';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const darkMode = useAppSelector((state) => state.theme.darkMode);

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      {children}
    </div>
  );
};

export default Layout;
