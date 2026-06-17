import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleOutline, ArrowUpward, EventBusy } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { getMySubscription, cancelSubscription } from '../../Api';
import './MySubscription.css';

interface SubscriptionInfo {
  currentPlanId: 'free' | 'starter' | 'pro' | 'business';
  expiresAt: string | null;
  startedAt: string | null;
  plan: {
    id: string;
    name: string;
    price: number;
    features: {
      maxShops: number;
      maxProductsPerShop: number;
      maxServicesPerShop: number;
      verifiedBadge: boolean;
      analytics: boolean;
      featuredSlotsPerMonth: number;
      prioritySupport: boolean;
      prioritySearch: boolean;
    };
    marketingFeatures: string[];
  };
  usage: {
    shops: number;
    products: number;
    services: number;
  };
}

const fmtLimit = (n: number) => (n < 0 ? '∞' : n.toString());
const fmtDate = (iso: string | null) => {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const MySubscription: React.FC = () => {
  const [data, setData] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMySubscription();
      setData(res);
    } catch (e) {
      console.error('Failed to load subscription:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async () => {
    if (!window.confirm("Cancel auto-renewal? You'll keep access until the end of your paid period.")) return;
    setCancelling(true);
    try {
      const res = await cancelSubscription();
      toast.success(res?.message || 'Auto-renewal cancelled');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not cancel');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="my-sub-loading">Loading subscription...</div>;
  if (!data) return null;

  const { plan, usage, expiresAt, currentPlanId } = data;
  const isPaid = currentPlanId !== 'free';
  const expiringSoon = expiresAt && new Date(expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

  return (
    <div className={`my-sub ${currentPlanId}`}>
      <div className="my-sub-header">
        <div>
          <h2>Your Plan</h2>
          <div className="my-sub-plan-name">
            {plan.name}
            {isPaid && <span className="my-sub-plan-badge">PAID</span>}
          </div>
        </div>
        <Link to="/pricing" className="my-sub-upgrade-btn">
          {isPaid ? <>Manage / Change Plan <ArrowUpward fontSize="small" /></> : <>Upgrade <ArrowUpward fontSize="small" /></>}
        </Link>
      </div>

      {isPaid && expiresAt && (
        <div className={`my-sub-expiry ${expiringSoon ? 'soon' : ''}`}>
          {expiringSoon
            ? <><EventBusy fontSize="small" /> Renews on <strong>{fmtDate(expiresAt)}</strong></>
            : <><CheckCircleOutline fontSize="small" /> Active until <strong>{fmtDate(expiresAt)}</strong></>}
        </div>
      )}

      <div className="my-sub-usage">
        <div className="my-sub-usage-row">
          <span>Shops / Businesses</span>
          <strong>{usage.shops} / {fmtLimit(plan.features.maxShops)}</strong>
        </div>
        <div className="my-sub-usage-row">
          <span>Products</span>
          <strong>{usage.products} / {fmtLimit(plan.features.maxProductsPerShop)} per shop</strong>
        </div>
        <div className="my-sub-usage-row">
          <span>Services</span>
          <strong>{usage.services} / {fmtLimit(plan.features.maxServicesPerShop)} per business</strong>
        </div>
        {/* Verified badge / Analytics / Featured slots are coming soon — hidden until built */}
      </div>

      {isPaid && (
        <button className="my-sub-cancel-btn" onClick={handleCancel} disabled={cancelling}>
          {cancelling ? 'Cancelling...' : "Don't auto-renew"}
        </button>
      )}

      {!isPaid && (
        <p className="my-sub-free-note">
          Free plan — upgrade to unlock more shops, listings, and a verified badge.
        </p>
      )}
    </div>
  );
};

export default MySubscription;
