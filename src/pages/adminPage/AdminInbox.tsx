import React, { useEffect, useState } from 'react';
import {
  CheckCircleOutline,
  Block,
  Delete,
  PersonOff,
  Store,
  ShoppingBag,
  RoomService,
  Flag,
  Inbox,
  Refresh
} from '@mui/icons-material';
import {
  getNewListings,
  moderateListing,
  getAdminReports,
  resolveReport,
  getModerationStats
} from '../../Api';
import { toast } from 'react-toastify';
import './AdminInbox.css';

type ItemType = 'shop' | 'product' | 'service';
type Action = 'safe' | 'deactivate' | 'delete' | 'ban';

interface NewListingItem {
  _id: string;
  name: string;
  description?: string;
  images?: string[];
  category?: any;
  serviceType?: string;
  productCategory?: string;
  price?: number;
  owner?: any;
  shopId?: any;
  createdAt: string;
  _itemType?: ItemType;
}

interface ReportItem {
  _id: string;
  reporter?: { name: string; email: string };
  targetType: ItemType;
  targetId: string;
  reason: string;
  comment: string;
  createdAt: string;
  status: string;
  target?: NewListingItem | null;
}

const REASON_LABELS: Record<string, string> = {
  illegal: 'Illegal content',
  inappropriate: 'Inappropriate / adult',
  scam: 'Scam or fraud',
  fake: 'Fake / misleading',
  spam: 'Spam',
  copyright: 'Copyright / IP',
  other: 'Other'
};

const itemTypeIcon = (type?: ItemType) => {
  if (type === 'shop') return <Store fontSize="small" />;
  if (type === 'product') return <ShoppingBag fontSize="small" />;
  if (type === 'service') return <RoomService fontSize="small" />;
  return null;
};

const AdminInbox: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'listings' | 'reports'>('listings');
  const [stats, setStats] = useState<{ pendingReports: number; pendingListings: number }>({ pendingReports: 0, pendingListings: 0 });
  const [listings, setListings] = useState<NewListingItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<'all' | ItemType>('all');

  const loadStats = async () => {
    try {
      const s = await getModerationStats();
      setStats(s);
    } catch (e) {
      console.error('Failed to load stats:', e);
    }
  };

  const loadListings = async () => {
    setLoading(true);
    try {
      const params = filterType !== 'all' ? `type=${filterType}&page=1&limit=30` : 'page=1&limit=30';
      const res = await getNewListings(params);
      setListings(res?.data || []);
    } catch (e) {
      console.error('Failed to load listings:', e);
      toast.error('Failed to load new listings');
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await getAdminReports('status=pending&page=1&limit=30');
      setReports(res?.data || []);
    } catch (e) {
      console.error('Failed to load reports:', e);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'listings') loadListings();
    else loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filterType]);

  const handleListingAction = async (item: NewListingItem, action: Action) => {
    if (action === 'delete' || action === 'ban') {
      const ok = window.confirm(action === 'ban'
        ? 'Ban the owner of this listing? This will disable their account.'
        : 'Permanently delete this listing?');
      if (!ok) return;
    }
    // Use item._itemType when present (combined feed), else fall back to active filterType
    const resolvedType: ItemType = (item._itemType as ItemType)
      || (filterType !== 'all' ? filterType : 'shop');
    try {
      await moderateListing({
        targetType: resolvedType,
        targetId: item._id,
        action
      });
      toast.success(`Marked as ${action === 'safe' ? 'safe' : action === 'deactivate' ? 'deactivated' : action === 'delete' ? 'deleted' : 'banned'}`);
      setListings(prev => prev.filter(l => l._id !== item._id));
      loadStats();
    } catch (e) {
      toast.error('Action failed');
    }
  };

  const handleReportAction = async (report: ReportItem, action: Action) => {
    if (action === 'delete' || action === 'ban') {
      const ok = window.confirm(action === 'ban'
        ? 'Ban the owner of the reported listing?'
        : 'Permanently delete the reported listing?');
      if (!ok) return;
    }
    try {
      await resolveReport(report._id, action);
      toast.success(`Resolved as ${action}`);
      setReports(prev => prev.filter(r => r._id !== report._id));
      loadStats();
    } catch (e) {
      toast.error('Action failed');
    }
  };

  const renderItemCard = (item: NewListingItem, isReported: boolean, report?: ReportItem) => {
    const itemType: ItemType = (item._itemType as ItemType) || (report?.targetType as ItemType) || 'shop';
    const displayName = item?.name || 'Untitled';
    const ownerName = (item.owner && typeof item.owner === 'object' ? item.owner.name : '')
      || (item.shopId && typeof item.shopId === 'object' ? item.shopId.name : '');
    return (
      <div key={item._id} className="inbox-card">
        <div className="inbox-card-img">
          {item.images?.[0] ? (
            <img src={item.images[0]} alt={displayName} />
          ) : (
            <div className="inbox-card-img-fallback">{itemTypeIcon(itemType)}</div>
          )}
        </div>
        <div className="inbox-card-content">
          <div className="inbox-card-top">
            <span className="inbox-type-badge">{itemTypeIcon(itemType)} {itemType}</span>
            <span className="inbox-card-time">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h3>{displayName}</h3>
          {item.price !== undefined && <p className="inbox-card-price">₹{item.price}</p>}
          {item.description && <p className="inbox-card-desc">{item.description.slice(0, 200)}{item.description.length > 200 ? '...' : ''}</p>}
          {ownerName && <p className="inbox-card-owner">Owner: {ownerName}</p>}

          {isReported && report && (
            <div className="inbox-report-info">
              <strong>Reason:</strong> {REASON_LABELS[report.reason] || report.reason}
              {report.comment && <p className="inbox-report-comment">"{report.comment}"</p>}
              {report.reporter && <p className="inbox-report-reporter">Reported by: {report.reporter.name}</p>}
            </div>
          )}
        </div>
        <div className="inbox-card-actions">
          <button
            className="inbox-btn safe"
            onClick={() => isReported && report ? handleReportAction(report, 'safe') : handleListingAction(item, 'safe')}
            title="Mark this listing as reviewed and safe"
          >
            <CheckCircleOutline fontSize="small" /> Safe
          </button>
          <button
            className="inbox-btn deactivate"
            onClick={() => isReported && report ? handleReportAction(report, 'deactivate') : handleListingAction(item, 'deactivate')}
            title="Hide from search but keep the data"
          >
            <Block fontSize="small" /> Deactivate
          </button>
          <button
            className="inbox-btn delete"
            onClick={() => isReported && report ? handleReportAction(report, 'delete') : handleListingAction(item, 'delete')}
            title="Permanently delete this listing"
          >
            <Delete fontSize="small" /> Delete
          </button>
          <button
            className="inbox-btn ban"
            onClick={() => isReported && report ? handleReportAction(report, 'ban') : handleListingAction(item, 'ban')}
            title="Ban the owner's account"
          >
            <PersonOff fontSize="small" /> Ban Owner
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-inbox">
      <div className="admin-inbox-header">
        <h2><Inbox /> Moderation Inbox</h2>
        <button className="admin-inbox-refresh" onClick={() => { activeTab === 'listings' ? loadListings() : loadReports(); loadStats(); }}>
          <Refresh fontSize="small" /> Refresh
        </button>
      </div>

      <div className="admin-inbox-tabs">
        <button
          className={`admin-inbox-tab ${activeTab === 'listings' ? 'active' : ''}`}
          onClick={() => setActiveTab('listings')}
        >
          New Listings
          {stats.pendingListings > 0 && <span className="admin-inbox-badge">{stats.pendingListings}</span>}
        </button>
        <button
          className={`admin-inbox-tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <Flag fontSize="small" /> Reports
          {stats.pendingReports > 0 && <span className="admin-inbox-badge red">{stats.pendingReports}</span>}
        </button>
      </div>

      {activeTab === 'listings' && (
        <div className="admin-inbox-filters">
          <button className={`filter-chip ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>All</button>
          <button className={`filter-chip ${filterType === 'shop' ? 'active' : ''}`} onClick={() => setFilterType('shop')}>Shops</button>
          <button className={`filter-chip ${filterType === 'product' ? 'active' : ''}`} onClick={() => setFilterType('product')}>Products</button>
          <button className={`filter-chip ${filterType === 'service' ? 'active' : ''}`} onClick={() => setFilterType('service')}>Services</button>
        </div>
      )}

      {loading ? (
        <div className="admin-inbox-loading">Loading...</div>
      ) : activeTab === 'listings' ? (
        listings.length === 0 ? (
          <div className="admin-inbox-empty">
            <CheckCircleOutline style={{ fontSize: 48, color: '#10b981' }} />
            <p>All caught up — no pending listings to review!</p>
          </div>
        ) : (
          <div className="admin-inbox-list">
            {listings.map(item => renderItemCard(item, false))}
          </div>
        )
      ) : (
        reports.length === 0 ? (
          <div className="admin-inbox-empty">
            <CheckCircleOutline style={{ fontSize: 48, color: '#10b981' }} />
            <p>No pending reports — nice and clean!</p>
          </div>
        ) : (
          <div className="admin-inbox-list">
            {reports.map(report => report.target
              ? renderItemCard(
                  { ...report.target, _itemType: report.targetType },
                  true,
                  report
                )
              : (
                <div key={report._id} className="inbox-card inbox-card-orphan">
                  <div className="inbox-card-content">
                    <h3>Reported {report.targetType} (no longer exists)</h3>
                    <p>The reported item has been deleted. You can mark this report as safe to clear it.</p>
                  </div>
                  <div className="inbox-card-actions">
                    <button className="inbox-btn safe" onClick={() => handleReportAction(report, 'safe')}>
                      <CheckCircleOutline fontSize="small" /> Clear
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )
      )}
    </div>
  );
};

export default AdminInbox;
