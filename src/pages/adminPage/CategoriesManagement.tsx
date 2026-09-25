import React, { useState, useEffect, useCallback } from 'react';
import { Add, Check, Close, Delete, Edit, Refresh, MergeType } from '@mui/icons-material';
import { toast } from 'react-toastify';
import {
  getCategoriesWithUsage,
  createCategory,
  updateCategory,
  deleteCategory,
  reassignCategory
} from '../../Api';
import { categoryIcon, isFallbackIcon } from '../../constants/categoryIcons';
import styles from './AdminDashboard.module.css';

/**
 * Shop categories.
 *
 * There was no screen for these at all: the API existed but nothing called it, so
 * adding a category meant Postman or editing the database by hand.
 *
 * Two things make this more than a list. First, the category name is copied onto
 * every shop, product and service when they are created, and shop search filters
 * on that copy — so renaming has to move the copies, and the counts here show how
 * many would move. Second, the icons are emoji: the homepage tiles were always
 * emoji hardcoded in the frontend, while this collection carried an image URL that
 * nothing rendered and that was the same broken placeholder on all 13 rows.
 *
 * "Names with no category" are the fragments left behind by typos and older
 * free-text entry — "baeuty" sitting beside "beauty". Moving them into a real
 * category is the same operation as a rename.
 */

interface CategoryRow {
  _id: string;
  name: string;
  icon?: string;
  shops: number;
  products: number;
  services: number;
}

interface OrphanRow {
  name: string;
  shops: number;
  products: number;
  services: number;
}

const totalOf = (row: { shops: number; products: number; services: number }) =>
  row.shops + row.products + row.services;

const CategoriesManagement: React.FC = () => {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [orphans, setOrphans] = useState<OrphanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');

  const [moveTarget, setMoveTarget] = useState<Record<string, string>>({});

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCategoriesWithUsage();
      setCategories(Array.isArray(data?.categories) ? data.categories : []);
      setOrphans(Array.isArray(data?.orphans) ? data.orphans : []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleAdd = async () => {
    if (newName.trim().length < 2) {
      toast.warning('Give the category a name of at least two letters.');
      return;
    }
    try {
      setBusy('new');
      await createCategory({ name: newName.trim(), icon: newIcon.trim() });
      toast.success(`"${newName.trim()}" added`);
      setNewName('');
      setNewIcon('');
      await fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not add that category');
    } finally {
      setBusy(null);
    }
  };

  const startEdit = (row: CategoryRow) => {
    setEditingId(row._id);
    setEditName(row.name);
    setEditIcon(row.icon || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditIcon('');
  };

  const handleSave = async (row: CategoryRow) => {
    const name = editName.trim();
    if (name.length < 2) {
      toast.warning('Give the category a name of at least two letters.');
      return;
    }

    // A rename rewrites the copy held by each listing. Say so before doing it,
    // because the number can be large and the change is not obviously reversible.
    const count = totalOf(row);
    if (name !== row.name && count > 0) {
      const ok = window.confirm(
        `Rename "${row.name}" to "${name}"?\n\n${count} listing(s) carry the old name and will be moved across, so they stay in this category.`
      );
      if (!ok) return;
    }

    try {
      setBusy(row._id);
      const result = await updateCategory(row._id, { name, icon: editIcon.trim() });
      const moved = result?.moved;
      const movedTotal = moved ? moved.shops + moved.products + moved.services : 0;
      toast.success(movedTotal > 0 ? `Saved. ${movedTotal} listing(s) moved across.` : 'Saved');
      cancelEdit();
      await fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not save that category');
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async (row: CategoryRow) => {
    if (!window.confirm(`Delete "${row.name}"?`)) return;
    try {
      setBusy(row._id);
      await deleteCategory(row._id);
      toast.success(`"${row.name}" deleted`);
      await fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not delete that category');
    } finally {
      setBusy(null);
    }
  };

  const handleMoveOrphan = async (orphan: OrphanRow) => {
    const categoryId = moveTarget[orphan.name];
    if (!categoryId) {
      toast.warning('Choose the category to move these into.');
      return;
    }
    const target = categories.find((c) => c._id === categoryId);
    const ok = window.confirm(
      `Move ${totalOf(orphan)} listing(s) from "${orphan.name}" into "${target?.name}"?`
    );
    if (!ok) return;

    try {
      setBusy(orphan.name);
      const result = await reassignCategory(orphan.name, categoryId);
      const moved = result?.moved;
      const movedTotal = moved ? moved.shops + moved.products + moved.services : 0;
      toast.success(`${movedTotal} listing(s) moved into ${result?.into}`);
      await fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not move those listings');
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return <div className={styles.contentSection}><p className={styles.loading}>Loading categories…</p></div>;
  }

  return (
    <div className={styles.contentSection}>
      <h2>Shop Categories</h2>
      <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '-0.5rem' }}>
        The list behind the homepage tiles and the category dropdown owners pick from.
        The icon is an emoji. Renaming a category also moves every listing that carries
        the old name, so nothing falls out of it.
      </p>

      <div className={styles.adControls} style={{ gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          className={styles.filterInput}
          style={{ width: '4.5rem', textAlign: 'center', fontSize: '1.1rem' }}
          placeholder="👕"
          value={newIcon}
          maxLength={8}
          onChange={(e) => setNewIcon(e.target.value)}
          aria-label="Category emoji"
        />
        <input
          type="text"
          className={styles.filterInput}
          placeholder="New category, e.g. Foods"
          value={newName}
          maxLength={40}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
        />
        <button className={styles.addButton} onClick={handleAdd} disabled={busy === 'new'}>
          <Add /> Add Category
        </button>
        <button className={styles.filterToggleButton} onClick={fetchAll}>
          <Refresh /> Refresh
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Icon</th>
              <th>Name</th>
              <th>Shops</th>
              <th>Products</th>
              <th>Services</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr><td colSpan={6} className={styles.noData}>No categories yet.</td></tr>
            )}
            {categories.map((row) => {
              const isEditing = editingId === row._id;
              return (
                <tr key={row._id}>
                  <td style={{ fontSize: '1.3rem' }}>
                    {isEditing ? (
                      <input
                        type="text"
                        className={styles.filterInput}
                        style={{ width: '4rem', textAlign: 'center', fontSize: '1.1rem' }}
                        value={editIcon}
                        maxLength={8}
                        onChange={(e) => setEditIcon(e.target.value)}
                        aria-label="Category emoji"
                      />
                    ) : (
                      <span
                        style={{ opacity: isFallbackIcon(row.icon) ? 0.45 : 1 }}
                        title={isFallbackIcon(row.icon) ? 'No emoji chosen — showing a default' : ''}
                      >
                        {categoryIcon(row.name, row.icon)}
                      </span>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        className={styles.filterInput}
                        value={editName}
                        maxLength={40}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSave(row); }}
                      />
                    ) : <strong>{row.name}</strong>}
                  </td>
                  <td>{row.shops}</td>
                  <td>{row.products}</td>
                  <td>{row.services}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      {isEditing ? (
                        <>
                          <button
                            className={styles.activateButton}
                            onClick={() => handleSave(row)}
                            disabled={busy === row._id}
                          >
                            <Check fontSize="small" /> Save
                          </button>
                          <button className={styles.deactivateButton} onClick={cancelEdit} disabled={busy === row._id}>
                            <Close fontSize="small" /> Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button className={styles.editButton} onClick={() => startEdit(row)}>
                            <Edit fontSize="small" /> Edit
                          </button>
                          <button
                            className={styles.deleteButton}
                            onClick={() => handleDelete(row)}
                            disabled={busy === row._id || totalOf(row) > 0}
                            title={totalOf(row) > 0
                              ? `${totalOf(row)} listing(s) still use this category — rename it or move them first`
                              : 'Delete this category'}
                          >
                            <Delete fontSize="small" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {orphans.length > 0 && (
        <>
          <h3 className={styles.sectionTitle}>Names with no category ({orphans.length})</h3>
          <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>
            Listings carry these names but no category exists for them, so they appear in
            no dropdown and customers cannot browse to them. Usually a typo or an old
            free-text entry. Move them into a real category to fix it.
          </p>
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Name on the listings</th>
                  <th>Shops</th>
                  <th>Products</th>
                  <th>Services</th>
                  <th>Move into</th>
                </tr>
              </thead>
              <tbody>
                {orphans.map((orphan) => (
                  <tr key={orphan.name}>
                    <td><strong>{orphan.name}</strong></td>
                    <td>{orphan.shops}</td>
                    <td>{orphan.products}</td>
                    <td>{orphan.services}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        <select
                          className={styles.filterSelect}
                          value={moveTarget[orphan.name] || ''}
                          onChange={(e) => setMoveTarget((prev) => ({ ...prev, [orphan.name]: e.target.value }))}
                        >
                          <option value="">Choose a category…</option>
                          {categories.map((c) => (
                            <option key={c._id} value={c._id}>{categoryIcon(c.name, c.icon)} {c.name}</option>
                          ))}
                        </select>
                        <button
                          className={styles.editButton}
                          onClick={() => handleMoveOrphan(orphan)}
                          disabled={busy === orphan.name}
                        >
                          <MergeType fontSize="small" /> Move
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default CategoriesManagement;
