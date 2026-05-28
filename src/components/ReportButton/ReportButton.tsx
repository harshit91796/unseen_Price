import React, { useState } from 'react';
import { Flag, Close } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { submitReport } from '../../Api';
import './ReportButton.css';

interface ReportButtonProps {
  targetType: 'shop' | 'product' | 'service';
  targetId: string;
  variant?: 'icon' | 'text';
}

const REASONS: { value: 'illegal' | 'inappropriate' | 'scam' | 'fake' | 'spam' | 'copyright' | 'other'; label: string; description: string }[] = [
  { value: 'illegal', label: 'Illegal content', description: 'Drugs, weapons, stolen goods, prescription drugs without license' },
  { value: 'inappropriate', label: 'Inappropriate / adult', description: 'Sexual, violent, or NSFW content' },
  { value: 'scam', label: 'Scam or fraud', description: 'Fake business, phishing, or attempt to steal money' },
  { value: 'fake', label: 'Fake / misleading', description: 'Counterfeit goods, fake brand, false claims' },
  { value: 'spam', label: 'Spam', description: 'Duplicate listings, irrelevant content, advertising abuse' },
  { value: 'copyright', label: 'Copyright / IP infringement', description: 'Uses brand logos, copyrighted images without permission' },
  { value: 'other', label: 'Something else', description: 'Anything not covered above' }
];

const ReportButton: React.FC<ReportButtonProps> = ({ targetType, targetId, variant = 'text' }) => {
  const currentUser = useSelector((state: any) => state.user.user);
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<typeof REASONS[number]['value'] | ''>('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const open = () => {
    if (!currentUser?._id) {
      toast.info('Please sign in to report content');
      return;
    }
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setReason('');
    setComment('');
  };

  const handleSubmit = async () => {
    if (!reason) {
      toast.error('Please select a reason');
      return;
    }
    setSubmitting(true);
    try {
      await submitReport({ targetType, targetId, reason, comment });
      toast.success('Thanks — our team will review this shortly.');
      close();
    } catch (err: any) {
      console.error('Failed to submit report:', err);
      toast.error(err?.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={`report-btn ${variant === 'icon' ? 'icon' : 'text'}`}
        onClick={open}
        aria-label={`Report this ${targetType}`}
      >
        <Flag fontSize="small" />
        {variant === 'text' && <span>Report</span>}
      </button>

      {isOpen && (
        <div className="report-modal-overlay" onClick={(e) => e.target === e.currentTarget && close()}>
          <div className="report-modal">
            <div className="report-modal-header">
              <h2>Report this {targetType}</h2>
              <button className="report-close" onClick={close} aria-label="Close">
                <Close />
              </button>
            </div>

            <p className="report-modal-subtitle">
              Reports are reviewed by our team. False reports may result in your account being restricted.
            </p>

            <div className="report-reasons">
              {REASONS.map((r) => (
                <label
                  key={r.value}
                  className={`report-reason ${reason === r.value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                  />
                  <div className="report-reason-content">
                    <div className="report-reason-label">{r.label}</div>
                    <div className="report-reason-desc">{r.description}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="report-comment-wrap">
              <label htmlFor="report-comment">Additional details (optional)</label>
              <textarea
                id="report-comment"
                rows={4}
                placeholder="Anything else our team should know?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
              />
              <div className="report-comment-counter">{comment.length}/1000</div>
            </div>

            <div className="report-actions">
              <button type="button" className="report-action-cancel" onClick={close} disabled={submitting}>
                Cancel
              </button>
              <button
                type="button"
                className="report-action-submit"
                onClick={handleSubmit}
                disabled={submitting || !reason}
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportButton;
