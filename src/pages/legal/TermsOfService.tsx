import React from 'react';
import { Link } from 'react-router-dom';
import LegalPageLayout from '../../components/legal/LegalPageLayout';

const TermsOfService: React.FC = () => {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="2026-05-08">
      <p>
        Welcome to Unseen Price. By accessing or using our website and services,
        you agree to be bound by these Terms of Service. Please read them carefully.
      </p>

      <h2>Acceptance of Terms</h2>
      <p>
        By creating an account, listing a shop or product, or otherwise using our
        platform, you agree to these Terms and our Privacy Policy. If you do not
        agree, do not use our services.
      </p>

      <h2>Description of Service</h2>
      <p>
        Unseen Price provides a platform for discovering local shops and products,
        and for shop owners to list their businesses and products. We do not sell
        products ourselves; we connect users with local sellers. Availability and
        accuracy of listings depend on the information provided by users and
        shop owners.
      </p>

      <h2>User Accounts and Responsibilities</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account
        and for all activity under your account. You agree to provide accurate
        information and to update it as needed. You must not use the service for
        any illegal purpose or in violation of any applicable laws or these Terms.
      </p>
      <ul>
        <li>Do not post false, misleading, or illegal content</li>
        <li>Do not harass others or misuse another user's or shop's information</li>
        <li>Do not attempt to gain unauthorized access to our systems or other accounts</li>
      </ul>

      <h2>Shop and Product Listings</h2>
      <p>
        If you list a shop or products, you represent that you have the right to
        do so and that your listings comply with applicable laws. We may remove
        or suspend listings that violate our policies or the law. We do not
        guarantee any level of visibility or traffic for your listings.
      </p>

      <h2>Subscription Plans, Billing, and Cancellation</h2>
      <p>
        Unseen Price offers a free plan and paid monthly subscription plans
        ("Pro" and "Business"). Plan prices, features, and limits are shown on
        our <Link to="/pricing">Pricing page</Link>.
      </p>
      <ul>
        <li>
          Paid plans are billed in advance for a 30-day period in Indian Rupees
          (INR) through Razorpay, our authorised payment processor.
        </li>
        <li>
          Unless you cancel auto-renewal before the end of your current period,
          your subscription will automatically renew at the then-current price.
        </li>
        <li>
          You can cancel auto-renewal at any time from your profile under
          "My Subscription". After cancellation, you keep access until the end
          of the period you've already paid for, and your account is downgraded
          to the Free plan thereafter.
        </li>
        <li>
          We may change plan prices, limits, or features with reasonable advance
          notice (at least 14 days for material changes). Changes apply at your
          next renewal — they do not retroactively affect the period you've
          already paid for.
        </li>
        <li>
          If a renewal payment fails, your account will be downgraded to the
          Free plan after our retry attempts are exhausted.
        </li>
      </ul>
      <p>
        Refunds are governed by our{' '}
        <Link to="/legal/refund">Refund & Cancellation Policy</Link>. By
        subscribing, you confirm you've read and agreed to that policy in
        addition to these Terms.
      </p>

      <h2>Plan Limits and Fair Use</h2>
      <p>
        Each plan has limits on the number of shops/businesses, products, and
        services you can list. We reserve the right to enforce these limits and
        to suspend accounts that attempt to circumvent them (for example, by
        creating multiple Free accounts to exceed Free-tier limits).
      </p>

      <h2>Intellectual Property</h2>
      <p>
        The Unseen Price name, logo, and the design of our platform are our
        intellectual property. You may not copy, modify, or use them without our
        written permission. You retain ownership of content you submit; by
        submitting it, you grant us a license to use, display, and distribute it
        in connection with the service.
      </p>

      <h2>Disclaimers</h2>
      <p>
        The service is provided "as is" and "as available." We disclaim warranties
        of merchantability, fitness for a particular purpose, and non-infringement.
        We are not responsible for the conduct of users or the quality, safety, or
        legality of shops or products listed on the platform.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, Unseen Price and its affiliates
        shall not be liable for any indirect, incidental, special, consequential,
        or punitive damages, or any loss of profits or data, arising from your use
        of the service.
      </p>

      <h2>Termination</h2>
      <p>
        We may suspend or terminate your account or access to the service at any
        time for violation of these Terms or for any other reason. You may close
        your account at any time. Provisions that by their nature should survive
        will remain in effect after termination.
      </p>

      <h2>Changes to Terms</h2>
      <p>
        We may modify these Terms from time to time. We will notify you of
        material changes by posting the updated Terms and updating the "Last
        updated" date. Your continued use of the service after changes constitutes
        acceptance of the new Terms.
      </p>

      <h2>Contact</h2>
      <p>
        For questions about these Terms of Service, contact us at
        support@unseenprice.com.
      </p>
    </LegalPageLayout>
  );
};

export default TermsOfService;
