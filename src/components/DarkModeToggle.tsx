import React from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks/hooks';
import { toggleDarkMode } from '../redux/theme/themeSlice';

const DarkModeToggle: React.FC = () => {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.theme.darkMode);

  return (
    <button onClick={() => dispatch(toggleDarkMode())}>
      {darkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
};

export default DarkModeToggle;
