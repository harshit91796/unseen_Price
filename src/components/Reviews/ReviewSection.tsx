import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Edit, Delete } from '@mui/icons-material';
import StarRating from './StarRating';
import {
  ReviewTargetType,
  submitReview,
  getReviewsForTarget,
  getMyReviewForTarget,
  deleteReview
} from '../../Api';
import './ReviewSection.css';

interface ReviewSectionProps {
  targetType: ReviewTargetType;
  targetId: string;
  /** Current aggregate rating to display in the header (from the parent doc). */
  averageRating?: number;
  /** Current review count to display in the header. */
  reviewCount?: number;
  /** Called when rating changes so parent can refetch its doc to get fresh aggregate. */
  onAggregateChanged?: () => void;
  /** ID of the listing's owner — they can't review their own item. */
  ownerId?: string;
}

interface ReviewItem {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: { _id: string; name: string; profilePic?: string };
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  targetType,
  targetId,
  averageRating = 0,
  reviewCount = 0,
  onAggregateChanged,
  ownerId
}) => {
  const currentUser = useSelector((state: any) => state.user.user);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [myReview, setMyReview] = useState<ReviewItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [draftRating, setDraftRating] = useState(0);
  const [draftComment, setDraftComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isOwner = !!(currentUser?._id && ownerId && currentUser._id === ownerId);

  const loadReviews = useCallback(async () => {
    if (!targetId) return;
    setLoading(true);
    try {
      const res = await getReviewsForTarget(targetType, targetId, 1, 20);
      setReviews(res?.data || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [targetType, targetId]);

  const loadMyReview = useCallback(async () => {
    if (!currentUser?._id || !targetId) return;
    try {
      const res = await getMyReviewForTarget(targetType, targetId);
      setMyReview(res?.data || null);
    } catch (err) {
      // 401 is expected if not logged in — silent
    }
  }, [targetType, targetId, currentUser?._id]);

  useEffect(() => {
    loadReviews();
    loadMyReview();
  }, [loadReviews, loadMyReview]);

  const openForm = () => {
    if (!currentUser?._id) {
      toast.info('Please sign in to leave a review');
      return;
    }
    if (isOwner) {
      toast.info("You can't review your own listing");
      return;
    }
    setDraftRating(myReview?.rating || 0);
    setDraftComment(myReview?.comment || '');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setDraftRating(0);
    setDraftComment('');
  };

  const handleSubmit = async () => {
    if (!draftRating || draftRating < 1 || draftRating > 5) {
      toast.error('Please pick a rating from 1 to 5');
      return;
    }
    setSubmitting(true);
    try {
      await submitReview({
        targetType,
        targetId,
        rating: draftRating,
        comment: draftComment.trim()
      });
      toast.success(myReview ? 'Review updated' : 'Thanks for your review!');
      closeForm();
      await Promise.all([loadReviews(), loadMyReview()]);
      onAggregateChanged?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMine = async () => {
    if (!myReview) return;
    if (!window.confirm('Delete your review?')) return;
    try {
      await deleteReview(myReview._id);
      toast.success('Review deleted');
      setMyReview(null);
      await loadReviews();
      onAggregateChanged?.();
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <section className="review-section">
      <div className="review-section-header">
        <div className="review-summary">
          <h3>Reviews</h3>
          {reviewCount > 0 ? (
            <div className="review-summary-row">
              <StarRating value={averageRating} size={20} />
              <span className="review-summary-rating">{averageRating.toFixed(1)}</span>
              <span className="review-summary-count">
                ({reviewCount} review{reviewCount > 1 ? 's' : ''})
              </span>
            </div>
          ) : (
            <p className="review-empty-summary">No reviews yet — be the first to share your experience.</p>
          )}
        </div>
        {!isOwner && (
          <button className="review-cta" onClick={openForm}>
            {myReview ? <><Edit fontSize="small" /> Edit your review</> : 'Write a review'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="review-form">
          <div className="review-form-stars">
            <span>Your rating:</span>
            <StarRating value={draftRating} size={28} editable onChange={setDraftRating} />
          </div>
          <textarea
            className="review-form-textarea"
            placeholder="Share what you liked or didn't (optional)"
            value={draftComment}
            onChange={(e) => setDraftComment(e.target.value)}
            maxLength={2000}
            rows={4}
          />
          <div className="review-form-counter">{draftComment.length}/2000</div>
          <div className="review-form-actions">
            <button className="review-cancel" onClick={closeForm} disabled={submitting}>
              Cancel
            </button>
            <button className="review-submit" onClick={handleSubmit} disabled={submitting || !draftRating}>
              {submitting ? 'Saving...' : (myReview ? 'Update Review' : 'Post Review')}
            </button>
          </div>
        </div>
      )}

      {myReview && !showForm && (
        <div className="review-mine">
          <div className="review-mine-header">
            <strong>Your review</strong>
            <div className="review-mine-actions">
              <button onClick={openForm} aria-label="Edit"><Edit fontSize="small" /></button>
              <button onClick={handleDeleteMine} aria-label="Delete"><Delete fontSize="small" /></button>
            </div>
          </div>
          <StarRating value={myReview.rating} size={16} />
          {myReview.comment && <p className="review-mine-comment">{myReview.comment}</p>}
        </div>
      )}

      <div className="review-list">
        {loading ? (
          <div className="review-list-loading">Loading reviews...</div>
        ) : reviews.length === 0 ? null : (
          reviews
            .filter(r => !myReview || r._id !== myReview._id)
            .map((r) => (
              <div key={r._id} className="review-card">
                <div className="review-card-header">
                  <div className="review-card-avatar">
                    {r.user?.profilePic
                      ? <img src={r.user.profilePic} alt={r.user.name} loading="lazy" />
                      : <span>{r.user?.name?.charAt(0).toUpperCase() || '?'}</span>}
                  </div>
                  <div className="review-card-meta">
                    <strong>{r.user?.name || 'Anonymous'}</strong>
                    <span className="review-card-date">{formatDate(r.createdAt)}</span>
                  </div>
                  <StarRating value={r.rating} size={14} className="review-card-stars" />
                </div>
                {r.comment && <p className="review-card-comment">{r.comment}</p>}
              </div>
            ))
        )}
      </div>
    </section>
  );
};

export default ReviewSection;
