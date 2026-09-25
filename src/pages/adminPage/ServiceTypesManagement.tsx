import React, { useState, useEffect, useCallback } from 'react';
import { Add, Check, Block, Delete, MergeType, Refresh } from '@mui/icons-material';
import { toast } from 'react-toastify';
import {
  getAdminServiceTypes,
  createServiceType,
  setServiceTypeStatus,
  mergeServiceType,
  deleteServiceType
} from '../../Api';
import { invalidateServiceTypes } from '../../hooks/useServiceTypes';
import styles from './AdminDashboard.module.css';

/**
 * The service types owners can choose from.
 *
 * This list used to be hardcoded in the frontend, so adding one needed a
 * developer and a deploy — and an owner whose trade was missing had to pick
 * something wrong or give up. Owners can now suggest a type through "Other" on the
 * Add Service form; it arrives here as a request, their listing already live and
 * searchable, and approving it is what puts the type into the customer filters.
 *
 * Rejecting takes a word off the dropdown without touching anyone's listing.
 * Merging is how near-duplicates get cleaned up: "tailer" folded into "tailor"
 * moves the listings across, so one trade stays one filter.
 */

interface ServiceType {
  _id: string;
  name: string;
  label: string;
  status: 'approved' | 'pending' | 'rejected';
  listingCount: number;
  requestedBy?: { name?: string; email?: string } | null;
  createdAt?: string;
}

const ServiceTypesManagement: React.FC = () => {
  const [types, setTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchTypes = useCallback(async () => {
    try {
      setLoading(true);
      const rows = await getAdminServiceTypes();
      setTypes(Array.isArray(rows) ? rows : []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not load service types');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  /** Any change here changes what owners and customers see, so drop the cache. */
  const afterChange = async () => {
    invalidateServiceTypes();
    await fetchTypes();
  };

  const handleAdd = async () => {
    if (newLabel.trim().length < 2) {
      toast.warning('Type a name with at least two letters.');
      return;
    }
    try {
      setBusyId('new');
      await createServiceType(newLabel.trim());
      toast.success(`"${newLabel.trim()}" is now a service type`);
      setNewLabel('');
      await afterChange();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not add that type');
    } finally {
      setBusyId(null);
    }
  };

  const handleStatus = async (type: ServiceType, status: 'approved' | 'rejected') => {
    try {
      setBusyId(type._id);
      await setServiceTypeStatus(type._id, status);
      toast.success(
        status === 'approved'
          ? `"${type.label}" now appears in the filters`
          : `"${type.label}" is off the dropdown. Existing listings are untouched.`
      );
      await afterChange();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not update that type');
    } finally {
      setBusyId(null);
    }
  };

  const handleMerge = async (type: ServiceType) => {
    const approved = types.filter((t) => t.status === 'approved' && t.name !== type.name);
    if (approved.length === 0) {
      toast.warning('There is no approved type to merge into yet.');
      return;
    }
    const target = window.prompt(
      `Merge "${type.label}" into which type?\n\nIts ${type.listingCount} listing(s) will move across and "${type.label}" will be removed.\n\nApproved types:\n${approved.map((t) => t.name).join(', ')}`,
      ''
    );
    if (!target) return;

    try {
      setBusyId(type._id);
      const result = await mergeServiceType(type._id, target.trim());
      toast.success(`Merged into ${result.into}. ${result.listingsMoved} listing(s) moved.`);
      await afterChange();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not merge that type');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (type: ServiceType) => {
    if (!window.confirm(`Delete "${type.label}" for good? Use Reject instead if you only want it off the dropdown.`)) {
      return;
    }
    try {
      setBusyId(type._id);
      await deleteServiceType(type._id);
      toast.success(`"${type.label}" deleted`);
      await afterChange();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not delete that type');
    } finally {
      setBusyId(null);
    }
  };

  const pending = types.filter((t) => t.status === 'pending');
  const approved = types.filter((t) => t.status === 'approved');
  const rejected = types.filter((t) => t.status === 'rejected');

  const renderRow = (type: ServiceType) => (
    <tr key={type._id}>
      <td>
        <strong>{type.label}</strong>
        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{type.name}</div>
      </td>
      <td>{type.listingCount}</td>
      <td>
        <span className={styles.statusBadge}>{type.status}</span>
      </td>
      <td>{type.requestedBy?.name || type.requestedBy?.email || '—'}</td>
      <td>
        <div className={styles.actionButtons}>
          {type.status !== 'approved' && (
            <button
              className={styles.activateButton}
              onClick={() => handleStatus(type, 'approved')}
              disabled={busyId === type._id}
              title="Show this type in every dropdown and filter"
            >
              <Check fontSize="small" /> Approve
            </button>
          )}
          {type.status !== 'rejected' && (
            <button
              className={styles.deactivateButton}
              onClick={() => handleStatus(type, 'rejected')}
              disabled={busyId === type._id}
              title="Take it off the dropdown. Listings already using it stay live."
            >
              <Block fontSize="small" /> Reject
            </button>
          )}
          <button
            className={styles.editButton}
            onClick={() => handleMerge(type)}
            disabled={busyId === type._id}
            title="Fold this into another type and move its listings across"
          >
            <MergeType fontSize="small" /> Merge
          </button>
          <button
            className={styles.deleteButton}
            onClick={() => handleDelete(type)}
            disabled={busyId === type._id || type.listingCount > 0}
            title={type.listingCount > 0 ? 'Listings still use this type — merge or reject it instead' : 'Delete for good'}
          >
            <Delete fontSize="small" />
          </button>
        </div>
      </td>
    </tr>
  );

  const renderTable = (rows: ServiceType[], emptyText: string) => (
    <div className={styles.tableContainer}>
      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>Type</th>
            <th>Live listings</th>
            <th>Status</th>
            <th>Requested by</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0
            ? rows.map(renderRow)
            : (
              <tr>
                <td colSpan={5} className={styles.noData}>{emptyText}</td>
              </tr>
            )}
        </tbody>
      </table>
    </div>
  );

  if (loading) {
    return <div className={styles.contentSection}><p className={styles.loading}>Loading service types…</p></div>;
  }

  return (
    <div className={styles.contentSection}>
      <h2>Service Types</h2>
      <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '-0.5rem' }}>
        The list every service dropdown reads — the owner Add and Edit forms, and the
        customer search filter. Approving a type is what makes customers able to
        filter by it.
      </p>

      <div className={styles.adControls} style={{ gap: '0.5rem', alignItems: 'center' }}>
        <input
          type="text"
          className={styles.filterInput}
          placeholder="New service type, e.g. Tailor"
          value={newLabel}
          maxLength={40}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
        />
        <button className={styles.addButton} onClick={handleAdd} disabled={busyId === 'new'}>
          <Add /> Add Type
        </button>
        <button className={styles.filterToggleButton} onClick={fetchTypes}>
          <Refresh /> Refresh
        </button>
      </div>

      <h3 className={styles.sectionTitle}>
        Requested by owners {pending.length > 0 ? `(${pending.length})` : ''}
      </h3>
      <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>
        Owners who picked “Other” because their trade was missing. Their listings are
        already live and findable by search; approving adds the type to the filters.
      </p>
      {renderTable(pending, 'No requests right now.')}

      <h3 className={styles.sectionTitle}>In use ({approved.length})</h3>
      {renderTable(approved, 'No approved types yet.')}

      {rejected.length > 0 && (
        <>
          <h3 className={styles.sectionTitle}>Rejected ({rejected.length})</h3>
          {renderTable(rejected, '')}
        </>
      )}
    </div>
  );
};

export default ServiceTypesManagement;
