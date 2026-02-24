import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import './LegalPageLayout.css';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
  title,
  lastUpdated,
  children,
}) => {
  return (
    <div className="legal-page">
      <div className="legal-page-container">
        <Link to="/" className="legal-page-back">
          <ArrowBack /> Back to Home
        </Link>
        <header className="legal-page-header">
          <h1 className="legal-page-title">{title}</h1>
          <p className="legal-page-meta">Last updated: {lastUpdated}</p>
        </header>
        <article className="legal-page-content">
          {children}
        </article>
      </div>
    </div>
  );
};

export default LegalPageLayout;
