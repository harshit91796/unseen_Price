import React from 'react';
// import blunt2 from '../assets/images/blunt2.jpg'
import blunt2 from '../assets/videos/loadingHome.mp4'

import './load.css'
const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-screen">
      <video src={blunt2} autoPlay loop muted />
    </div>
  );
};

export default LoadingScreen;
