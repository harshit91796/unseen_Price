import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Check, Star, AutoAwesome, Schedule } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { getPlans, getMySubscription, createPaymentOrder, verifyPayment } from '../../Api';
import { openRazorpayCheckout } from '../../utils/razorpayCheckout';
import './pricingPage.css';

interface Plan {
  id: 'free' | 'starter' | 'pro' | 'business';
  name: string;
  price: number;
  originalPrice: number | null;
  durationDays: number | null;
  billingLabel: string;
  description: string;
  marketingFeatures: string[];        // features delivered today
  comingSoonFeatures?: string[];      // promised, not yet built
  features: any;
}

const PricingPage: React.FC = () => {
  const user = useSelector((state: any) => state.user.user);
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string>('free');
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [plansRes, mySubRes] = await Promise.all([
          getPlans(),
          user ? getMySubscription().catch(() => null) : Promise.resolve(null)
        ]);
        setPlans(plansRes?.plans || []);
        if (mySubRes?.currentPlanId) setCurrentPlanId(mySubRes.currentPlanId);
      } catch (e) {
        console.error('Failed to load pricing:', e);
        toast.error('Could not load plans. Try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleUpgrade = async (planId: 'starter' | 'pro' | 'business') => {
    if (!user?._id) {
      toast.info('Please sign in to subscribe');
      navigate('/login');
      return;
    }
    if (planId === currentPlanId) return;

    setUpgrading(planId);
    try {
      // 1. Create order on backend
      const order = await createPaymentOrder(planId);

      // 2. Open Razorpay Checkout modal
      const result = await openRazorpayCheckout({
        razorpayKeyId: order.razorpayKeyId,
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: 'Unseen Price',
        description: `${order.plan.name} plan — ₹${order.plan.price}/month`,
        prefill: order.prefill,
        theme: { color: '#667eea' }
      });

      // 3. Verify signature on backend & activate plan
      await verifyPayment(result);

      toast.success(`Welcome to ${order.plan.name}! 🎉`);
      setCurrentPlanId(planId);
      setTimeout(() => window.location.reload(), 800);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message;
      if (msg === 'Payment cancelled') {
        toast.info('Payment cancelled');
      } else {
        toast.error(msg || 'Payment failed');
      }
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) {
    return (
      <div className="pricing-page-loading">
        <div className="pricing-spinner" />
        <p>Loading plans...</p>
      </div>
    );
  }

  const sortedPlans = [...plans].sort((a, b) => a.price - b.price);

  return (
    <div className="pricing-page">
      <div className="pricing-hero">
        <h1>Simple, transparent pricing</h1>
        <p>Start free. Upgrade when you're ready to grow.</p>
      </div>

      <div className="pricing-grid">
        {sortedPlans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const isFeatured = plan.id === 'pro';
          const isUpgrading = upgrading === plan.id;
          return (
            <div
              key={plan.id}
              className={`pricing-card ${isFeatured ? 'featured' : ''} ${isCurrent ? 'current' : ''}`}
            >
              {isFeatured && (
                <div className="pricing-badge">
                  <AutoAwesome fontSize="small" /> Most Popular
                </div>
              )}
              {isCurrent && <div className="pricing-current-badge">Current plan</div>}

              <div className="pricing-card-head">
                <h2>{plan.name}</h2>
                <p className="pricing-description">{plan.description}</p>
                <div className="pricing-price-row">
                  <span className="pricing-currency">₹</span>
                  <span className="pricing-amount">{plan.price}</span>
                </div>
                {plan.billingLabel && (
                  <p className="pricing-billing-label">{plan.billingLabel}</p>
                )}
                {plan.originalPrice && plan.originalPrice > plan.price && (
                  <div className="pricing-launch-offer">
                    <span className="pricing-launch-tag">LAUNCH OFFER</span>
                    <span className="pricing-original">
                      Regular: ₹{plan.originalPrice}
                    </span>
                    <span className="pricing-savings">
                      Save ₹{plan.originalPrice - plan.price}
                    </span>
                  </div>
                )}
              </div>

              <ul className="pricing-features">
                {plan.marketingFeatures.map((feat, i) => (
                  <li key={i}>
                    <Check fontSize="small" className="pricing-check" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              {plan.comingSoonFeatures && plan.comingSoonFeatures.length > 0 && (
                <div className="pricing-coming-soon">
                  <div className="pricing-coming-soon-header">
                    <Schedule fontSize="small" />
                    <span>Coming soon</span>
                  </div>
                  <ul className="pricing-coming-soon-list">
                    {plan.comingSoonFeatures.map((feat, i) => (
                      <li key={i}>
                        <span className="pricing-coming-soon-dot">○</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                className={`pricing-cta ${isFeatured ? 'primary' : 'secondary'}`}
                disabled={isCurrent || plan.id === 'free' || isUpgrading}
                onClick={() => handleUpgrade(plan.id as 'starter' | 'pro' | 'business')}
              >
                {isCurrent ? 'Your plan'
                  : plan.id === 'free' ? 'Free forever'
                  : isUpgrading ? 'Opening checkout...'
                  : `Upgrade to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <div className="pricing-footnote">
        <p>
          <Schedule fontSize="small" /> <strong>About "Coming Soon" features:</strong> we ship
          fast — these are on our roadmap and will be added automatically to your plan as they
          launch. We won't charge extra. Today's payment locks in your tier.
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          <Star fontSize="small" /> Cancel anytime — you keep access until the end of your paid
          period. See our <a href="/legal/refund">Refund & Cancellation Policy</a>.
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          Need a custom plan for a larger business?{' '}
          <a href="mailto:support@unseenprice.com">Get in touch</a>.
        </p>
      </div>
    </div>
  );
};

export default PricingPage;
