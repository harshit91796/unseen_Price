/**
 * Razorpay Checkout helper.
 *
 * Loads the Razorpay JS SDK on demand and opens the checkout modal.
 * Returns a Promise that resolves with the payment response from the user,
 * or rejects if they close the modal / payment fails.
 */

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

/**
 * Lazily inject the Razorpay script tag into <head>.
 * Resolves once the SDK is available on window.Razorpay.
 */
const loadRazorpaySdk = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();

    // If a script tag exists already, wait for it
    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay SDK')));
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.head.appendChild(script);
  });

export interface CheckoutOptions {
  razorpayKeyId: string;
  orderId: string;
  amount: number;             // in paise
  currency: string;           // 'INR'
  name: string;               // your business / app name
  description: string;        // shown in the modal
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: { color?: string };
  notes?: Record<string, string>;
}

export interface CheckoutResult {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export const openRazorpayCheckout = async (opts: CheckoutOptions): Promise<CheckoutResult> => {
  await loadRazorpaySdk();
  if (!window.Razorpay) throw new Error('Razorpay SDK unavailable');

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: opts.razorpayKeyId,
      order_id: opts.orderId,
      amount: opts.amount,
      currency: opts.currency,
      name: opts.name,
      description: opts.description,
      prefill: opts.prefill || {},
      notes: opts.notes || {},
      theme: opts.theme || { color: '#667eea' },
      handler: (response: CheckoutResult) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled'))
      }
    });

    rzp.on('payment.failed', (response: any) => {
      reject(new Error(response?.error?.description || 'Payment failed'));
    });

    rzp.open();
  });
};
