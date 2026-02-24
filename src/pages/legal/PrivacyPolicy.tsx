import React from 'react';
import { Link } from 'react-router-dom';
import LegalPageLayout from '../../components/legal/LegalPageLayout';

const PrivacyPolicy: React.FC = () => {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="January 24, 2026">
      <p>
        Unseen Price ("we", "our", or "us") is committed to protecting your privacy.
        This Privacy Policy explains how we collect, use, disclose, and safeguard
        your information when you use our website and services.
      </p>

      <h2>Information We Collect</h2>
      <p>
        We may collect information that you provide directly to us, including when
        you create an account, add a shop or product, use search or location
        features, or contact us for support.
      </p>
      <ul>
        <li>Account information (name, email, phone, profile picture)</li>
        <li>Shop and product information you list</li>
        <li>Location data when you choose to share it for nearby results</li>
        <li>Communications and support requests</li>
        <li>Usage data (e.g., pages visited, features used)</li>
      </ul>

      <h2>How We Use Your Information</h2>
      <p>
        We use the information we collect to provide, maintain, and improve our
        services; to personalize your experience; to communicate with you; and to
        comply with legal obligations. We do not sell your personal information
        to third parties.
      </p>

      <h2>Data Sharing and Disclosure</h2>
      <p>
        We may share your information with service providers who assist in
        operating our platform (e.g., hosting, analytics), when required by law,
        or to protect our rights and safety. Shop and product information you
        publish may be visible to other users as part of the service.
      </p>

      <h2>Data Security</h2>
      <p>
        We implement appropriate technical and organizational measures to protect
        your personal data. No method of transmission over the internet is 100%
        secure, and we cannot guarantee absolute security.
      </p>

      <h2>Your Rights</h2>
      <p>
        Depending on your location, you may have rights to access, correct,
        delete, or port your data, or to object to or restrict certain processing.
        Contact us at the email in the footer to exercise these rights.
      </p>

      <h2>Cookies and Similar Technologies</h2>
      <p>
        We use cookies and similar technologies as described in our{' '}
        <Link to="/legal/cookies">Cookie Policy</Link>. You can manage your preferences
        in your browser settings.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of
        material changes by posting the updated policy on this page and updating
        the "Last updated" date. Your continued use of the service after changes
        constitutes acceptance of the updated policy.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy or our data practices,
        please contact us at support@unseenprice.com.
      </p>
    </LegalPageLayout>
  );
};

export default PrivacyPolicy;
