import React from 'react';
import { Link } from 'react-router-dom';
import LegalPageLayout from '../../components/legal/LegalPageLayout';

const RefundPolicy: React.FC = () => {
  return (
    <LegalPageLayout title="Refund & Cancellation Policy" lastUpdated="2026-05-08">
      <p>
        This Refund & Cancellation Policy explains how subscriptions to paid plans
        on Unseen Price work, including how to cancel and when refunds are
        available. By subscribing to a paid plan, you agree to the terms below.
      </p>

      <h2>Subscription Plans</h2>
      <p>
        Unseen Price offers a free tier and paid monthly subscription plans
        (currently "Pro" and "Business"). Plan prices, durations, and features
        are listed on our{' '}
        <Link to="/pricing">Pricing page</Link> and may be updated from time to time.
        Your current price is locked in for the duration of your active billing
        cycle.
      </p>

      <h2>Billing & Renewal</h2>
      <ul>
        <li>Paid plans are billed in advance for a 30-day period.</li>
        <li>
          Unless you cancel auto-renewal, your subscription will automatically
          renew at the end of each billing cycle at the then-current price.
        </li>
        <li>
          All charges are processed in Indian Rupees (INR) through Razorpay, our
          payment processor. We do not store your card or UPI details on our
          servers.
        </li>
        <li>
          A successful payment grants you 30 days of access to the features of
          the plan you purchased, from the date of payment (or from the end of
          your previous active period if you're renewing the same plan).
        </li>
      </ul>

      <h2>Cancelling Auto-Renewal</h2>
      <p>
        You can cancel auto-renewal at any time from the{' '}
        <strong>My Subscription</strong> section of your profile page, or by
        emailing us at support@unseenprice.com. After cancellation:
      </p>
      <ul>
        <li>
          Your plan remains <strong>active until the end of your current paid
          period</strong>. You will continue to enjoy all paid features during
          this time.
        </li>
        <li>
          At the end of the period, your account is automatically downgraded to
          the Free plan. No further charges will be made.
        </li>
        <li>
          Cancelling does not delete your account, listings, reviews, or any
          other data — only your paid plan stops renewing.
        </li>
      </ul>

      <h2>Refund Policy</h2>
      <p>
        Because access to paid features is granted immediately upon successful
        payment, we follow a strict <strong>no-refund policy</strong> on
        subscription charges in general. Specifically:
      </p>
      <ul>
        <li>
          <strong>No pro-rated refunds.</strong> Cancelling mid-cycle does not
          entitle you to a partial refund for unused days.
        </li>
        <li>
          <strong>No refunds for plan downgrades.</strong> If you switch from
          Business to Pro mid-cycle, the change takes effect at your next renewal.
        </li>
        <li>
          <strong>No refunds for unused features.</strong> Not using analytics,
          featured slots, or other plan benefits does not qualify for a refund.
        </li>
      </ul>

      <h3>Exceptions (Refund-Eligible Cases)</h3>
      <p>
        We will issue a full or partial refund at our discretion in the following
        cases:
      </p>
      <ul>
        <li>
          <strong>Duplicate payment</strong> — if you were charged twice for the
          same billing cycle due to a technical error, the duplicate charge will
          be refunded in full.
        </li>
        <li>
          <strong>Failed service delivery</strong> — if a technical issue on our
          side prevented you from accessing paid features for an extended period
          (more than 72 consecutive hours), you may request a credit or pro-rated
          refund for that period.
        </li>
        <li>
          <strong>Account suspended for our reason</strong> — if your account is
          banned by us for reasons other than violating our Terms of Service, the
          unused portion of your paid period will be refunded.
        </li>
        <li>
          <strong>Unauthorized payment</strong> — if someone made a payment from
          your account without your authorization and you report it within 30
          days, we will investigate and refund if the claim is verified.
        </li>
      </ul>

      <h2>Refunds Will NOT Be Issued For</h2>
      <ul>
        <li>Change of mind after purchase.</li>
        <li>Account suspension or ban due to Terms of Service violations.</li>
        <li>Inability to use the platform due to issues on your side
            (internet, device, third-party service).</li>
        <li>Plan benefits you didn't claim (e.g. unused featured slots).</li>
        <li>Failure to cancel before the next auto-renewal date.</li>
      </ul>

      <h2>How to Request a Refund</h2>
      <p>
        If you believe you're eligible for a refund under the exceptions above:
      </p>
      <ol>
        <li>Email <strong>support@unseenprice.com</strong> within 30 days of the
            charge.</li>
        <li>Include the date and amount of the charge, the email associated with
            your account, and the reason for the refund request.</li>
        <li>
          We'll review and respond within 5 business days. Approved refunds are
          processed via Razorpay and typically reach your original payment method
          within 5-10 business days (timing depends on your bank).
        </li>
      </ol>

      <h2>Failed Payments</h2>
      <p>
        If a renewal payment fails (e.g. expired card, insufficient funds), we
        will retry the charge a few times over a few days. If all retries fail,
        your account is downgraded to the Free plan and you'll receive an email
        notification. You can re-subscribe at any time from the pricing page.
      </p>

      <h2>Account Deletion</h2>
      <p>
        If you delete your account while on a paid plan, you forfeit access to
        the remaining paid period. No refund is issued for the unused portion.
        Email <strong>support@unseenprice.com</strong> to request account
        deletion.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        We may update this policy from time to time. Any changes will be posted
        on this page with an updated "Last updated" date. Material changes that
        reduce your rights will be communicated at least 7 days in advance via
        email. Continued use of paid features after a policy update constitutes
        acceptance of the updated policy.
      </p>

      <h2>Contact</h2>
      <p>
        For questions about subscriptions, refunds, or billing:
      </p>
      <ul>
        <li>Email: <strong>support@unseenprice.com</strong></li>
      </ul>
      <p>
        See also our <Link to="/legal/terms">Terms of Service</Link> and{' '}
        <Link to="/legal/privacy">Privacy Policy</Link>.
      </p>
    </LegalPageLayout>
  );
};

export default RefundPolicy;
