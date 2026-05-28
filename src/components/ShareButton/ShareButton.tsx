import React, { useState } from 'react';
import { WhatsApp, ContentCopy, Share, Check } from '@mui/icons-material';
import { toast } from 'react-toastify';
import './ShareButton.css';

interface ShareButtonProps {
  /** Title shown in the share text. e.g. "Bhopal Salon" */
  title: string;
  /** Optional second line. e.g. "Haircut starting at ₹500" */
  subtitle?: string;
  /** URL to share. Defaults to current page. */
  url?: string;
  /** Button style: full button with text, or compact icon-only. */
  variant?: 'full' | 'compact';
  /** Optional className for the wrapper. */
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  title,
  subtitle,
  url,
  variant = 'full',
  className
}) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  // Build the WhatsApp message
  const message = subtitle
    ? `${title}\n${subtitle}\n${shareUrl}`
    : `${title}\n${shareUrl}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        toast.success('Link copied!');
      } catch {
        toast.error('Could not copy link');
      }
      document.body.removeChild(ta);
    }
  };

  // Use Web Share API when available (mobile) for native share sheet
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: subtitle, url: shareUrl });
        return true;
      } catch (err) {
        // User cancelled or error — fall through to dropdown
      }
    }
    return false;
  };

  const handleClick = async () => {
    const shared = await handleNativeShare();
    if (!shared) setOpen(o => !o);
  };

  return (
    <div className={`share-btn-wrap ${className || ''}`}>
      <button
        type="button"
        className={`share-btn ${variant === 'compact' ? 'compact' : 'full'}`}
        onClick={handleClick}
        aria-label="Share"
      >
        <Share fontSize="small" />
        {variant === 'full' && <span>Share</span>}
      </button>

      {open && (
        <>
          <div className="share-overlay" onClick={() => setOpen(false)} />
          <div className="share-dropdown" role="menu">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="share-option whatsapp"
              onClick={() => setOpen(false)}
            >
              <WhatsApp fontSize="small" />
              <span>Share on WhatsApp</span>
            </a>
            <button type="button" className="share-option" onClick={handleCopy}>
              {copied ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
              <span>{copied ? 'Copied!' : 'Copy link'}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShareButton;
