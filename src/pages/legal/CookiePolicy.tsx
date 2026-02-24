import React from 'react';
import { Link } from 'react-router-dom';
import LegalPageLayout from '../../components/legal/LegalPageLayout';

const CookiePolicy: React.FC = () => {
  return (
    <LegalPageLayout title="Cookie Policy" lastUpdated="January 24, 2026">
      <p>
        This Cookie Policy explains how Unseen Price uses cookies and similar
        technologies when you use our website. For more on how we use your
        personal data, see our <Link to="/legal/privacy">Privacy Policy</Link>.
      </p>

      <h2>What Are Cookies?</h2>
      <p>
        Cookies are small text files that are stored on your device when you
        visit a website. They are widely used to make websites work more
        efficiently, to remember your preferences, and to understand how visitors
        use the site.
      </p>

      <h2>How We Use Cookies</h2>
      <p>
        We use cookies and similar technologies (e.g., local storage) for the
        following purposes:
      </p>
      <ul>
        <li>
          <strong>Essential:</strong> Required for the site to function (e.g.,
          keeping you logged in, security).
        </li>
        <li>
          <strong>Preferences:</strong> To remember your settings (e.g., theme,
          language).
        </li>
        <li>
          <strong>Analytics:</strong> To understand how visitors use our site so
          we can improve it (e.g., which pages are visited, general location).
        </li>
      </ul>

      <h2>Types of Cookies We Use</h2>
      <h3>Strictly necessary</h3>
      <p>
        These cookies are essential for the website to work. They may include
        session and authentication-related cookies. You cannot opt out of these
        without affecting site functionality.
      </p>
      <h3>Functional</h3>
      <p>
        These cookies enable enhanced functionality and personalization (e.g.,
        remembering your choices). They may be set by us or by third-party
        providers whose services we use.
      </p>
      <h3>Analytics</h3>
      <p>
        We may use analytics cookies to collect information about how visitors
        use our site. This helps us improve our service. The data is typically
        aggregated and anonymized.
      </p>

      <h2>Managing Cookies</h2>
      <p>
        You can control and manage cookies through your browser settings. Most
        browsers allow you to refuse or delete cookies. Note that blocking
        certain cookies may affect how the site works (for example, you may need
        to log in again each time you visit).
      </p>
      <p>
        For more information on how to manage cookies in your browser, see your
        browser's help or settings (e.g., Chrome, Firefox, Safari, Edge).
      </p>

      <h2>Updates</h2>
      <p>
        We may update this Cookie Policy from time to time to reflect changes in
        our practices or for legal reasons. The "Last updated" date at the top
        will be revised when we do. We encourage you to review this page
        periodically.
      </p>

      <h2>Contact</h2>
      <p>
        If you have questions about our use of cookies, please contact us at
        support@unseenprice.com.
      </p>
    </LegalPageLayout>
  );
};

export default CookiePolicy;
