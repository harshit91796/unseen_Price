import React, { useState, useEffect } from 'react';
import './ServiceDetail.css';
import { Link, useParams } from 'react-router-dom';
import {
  Schedule,
  Store,
  LocationOn,
  EventAvailable,
  CheckCircleOutline,
  Phone,
  Email
} from '@mui/icons-material';
import { getServiceDetails } from '../../Api';
import { toast } from 'react-toastify';
import ImageModal from '../../components/imageModal/ImageModal';
import ReportButton from '../../components/ReportButton/ReportButton';
import SafeImage from '../../components/SafeImage/SafeImage';
import ReviewSection from '../../components/Reviews/ReviewSection';
import StarRating from '../../components/Reviews/StarRating';
import ShareButton from '../../components/ShareButton/ShareButton';
import PriceDisplay from '../../components/Price/PriceDisplay';

const PRICE_TYPE_LABELS: Record<string, string> = {
  fixed: '',
  starting_from: 'Starting from',
  per_hour: '/ hour',
  per_night: '/ night',
  per_session: '/ session',
  per_person: '/ person'
};

const ServiceDetail: React.FC = () => {
  const { serviceId } = useParams();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const data = await getServiceDetails(serviceId as string);
        setService(data);
      } catch (err) {
        toast.error('Failed to load service details');
      } finally {
        setLoading(false);
      }
    };
    if (serviceId) fetchService();
  }, [serviceId]);

  if (loading) return <div className="service-detail-loading">Loading...</div>;
  if (!service) return <div className="service-detail-loading">Service not found</div>;

  const priceLabel = PRICE_TYPE_LABELS[service.priceType] || '';
  const priceDisplay = service.priceType === 'starting_from'
    ? `${priceLabel} ₹${service.price}`
    : `₹${service.price} ${priceLabel}`.trim();

  return (
    <div className="service-detail-container">
      <div className="service-detail-grid">
        {/* Image Gallery */}
        <div className="service-images-section">
          <div className="service-main-image-wrap">
            <SafeImage
              src={service.images?.[0]}
              alt={service.name}
              className="service-main-image"
              onClick={() => setSelectedImageIndex(0)}
              preset="HERO"
              lazy={false}
            />
            {service.bookingRequired && (
              <span className="service-booking-badge">
                <EventAvailable fontSize="small" /> Booking Required
              </span>
            )}
          </div>
          {service.images?.length > 1 && (
            <div className="service-thumbnails">
              {service.images.map((img: string, idx: number) => (
                <SafeImage
                  key={idx}
                  src={img}
                  alt={`${service.name} ${idx + 1}`}
                  className="service-thumb"
                  onClick={() => setSelectedImageIndex(idx)}
                  preset="THUMB"
                />
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="service-info-section">
          <div className="service-type-tag">
            {service.serviceType?.replace('-', ' ').toUpperCase()}
          </div>
          <h1 className="service-name">{service.name}</h1>

          {service.reviewCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <StarRating value={service.rating || 0} size={16} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{(service.rating || 0).toFixed(1)}</span>
              <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                ({service.reviewCount} review{service.reviewCount > 1 ? 's' : ''})
              </span>
            </div>
          )}

          <div className="service-price-row">
            <PriceDisplay
              price={service.price}
              mrp={service.mrp}
              variant="detail"
              suffix={service.priceType !== 'fixed' && service.priceType !== 'starting_from' ? priceLabel : undefined}
            />
            {service.duration && (
              <span className="service-duration">
                <Schedule fontSize="small" /> {service.duration}
              </span>
            )}
          </div>

          <div className="service-meta">
            {service.isAvailable ? (
              <span className="service-available">
                <CheckCircleOutline fontSize="small" /> Available now
              </span>
            ) : (
              <span className="service-unavailable">Currently unavailable</span>
            )}
          </div>

          <div className="service-description">
            <h3>About this service</h3>
            <p>{service.description}</p>
          </div>

          {/* Shop Info */}
          {service.shopId && typeof service.shopId === 'object' && (
            <div className="service-shop-info">
              <h3><Store fontSize="small" /> Offered by</h3>
              <Link to={`/shop/${service.shopId._id}`} className="service-shop-link">
                <strong>{service.shopId.name}</strong>
              </Link>
              {service.shopId.address && (
                <p className="service-shop-address">
                  <LocationOn fontSize="small" />
                  {[service.shopId.address.street, service.shopId.address.city, service.shopId.address.state]
                    .filter(Boolean).join(', ')}
                </p>
              )}
              {service.shopId.contact?.phone && (
                <p className="service-shop-contact">
                  <Phone fontSize="small" /> {service.shopId.contact.phone}
                </p>
              )}
              {service.shopId.contact?.email && (
                <p className="service-shop-contact">
                  <Email fontSize="small" /> {service.shopId.contact.email}
                </p>
              )}
            </div>
          )}

          <div className="service-actions">
            <button className="service-cta-btn primary">
              {service.bookingRequired ? 'Book Now' : 'Inquire'}
            </button>
            {service.shopId && typeof service.shopId === 'object' && (
              <Link to={`/shop/${service.shopId._id}`} className="service-cta-btn secondary">
                View Business
              </Link>
            )}
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <ShareButton
              title={service.name}
              subtitle={`${service.serviceType?.replace('-', ' ')} · ₹${service.price}`}
            />
            <ReportButton targetType="service" targetId={service._id} variant="text" />
          </div>
        </div>
      </div>

      <ReviewSection
        targetType="service"
        targetId={service._id}
        averageRating={service.rating || 0}
        reviewCount={service.reviewCount || 0}
        ownerId={typeof service.shopId === 'object' ? service.shopId?.owner : undefined}
        onAggregateChanged={() => {
          // Refresh service to get updated rating/reviewCount
          getServiceDetails(serviceId as string).then(setService).catch(() => {});
        }}
      />

      {selectedImageIndex !== null && (
        <ImageModal
          isOpen={selectedImageIndex !== null}
          onClose={() => setSelectedImageIndex(null)}
          images={service.images}
          currentIndex={selectedImageIndex}
        />
      )}
    </div>
  );
};

export default ServiceDetail;
