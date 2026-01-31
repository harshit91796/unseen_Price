import React, { useState, useEffect, useCallback } from 'react';
import { People, Delete, Edit, Search, FilterList } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { getAdminUsers, updateUserRole, deleteUser } from '../../Api';
import { useDebounce } from '../../hooks/useDebounce';
import styles from './AdminDashboard.module.css';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UsersResponse {
  data: User[];
  pagination: Pagination;
}

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [editingRole, setEditingRole] = useState<{ userId: string; role: string } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    dateFrom: '',
    dateTo: '',
  });

  const debouncedSearch = useDebounce(searchQuery, 500);

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    
    if (debouncedSearch.trim()) {
      params.append('search', debouncedSearch.trim());
    }
    if (filters.role) {
      params.append('role', filters.role);
    }
    if (filters.dateFrom) {
      params.append('dateFrom', filters.dateFrom);
    }
    if (filters.dateTo) {
      params.append('dateTo', filters.dateTo);
    }
    params.append('page', pagination.page.toString());
    params.append('limit', pagination.limit.toString());
    
    return params.toString();
  }, [debouncedSearch, filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchUsers();
  }, [buildQueryString]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const queryString = buildQueryString();
      const response: UsersResponse = await getAdminUsers(queryString);
      setUsers(response.data || []);
      setPagination(response.pagination || pagination);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success('User role updated successfully');
      fetchUsers();
      setEditingRole(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete user');
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({ role: '', dateFrom: '', dateTo: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (loading && users.length === 0) {
    return <div className={styles.loading}>Loading users...</div>;
  }

  return (
    <div className={styles.contentSection}>
      <h2>User Management</h2>
      
      {/* Search and Filters */}
      <div className={styles.searchFiltersContainer}>
        <div className={styles.searchBar}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <button
          className={styles.filterToggleButton}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FilterList />
          Filters {showFilters ? '▲' : '▼'}
        </button>
      </div>

      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label>Role</label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">All Roles</option>
                <option value="customer">Customer</option>
                <option value="shopOwner">Shop Owner</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className={styles.filterInput}
              />
            </div>
            <div className={styles.filterGroup}>
              <label>Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className={styles.filterInput}
              />
            </div>
            <button className={styles.clearFiltersButton} onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>
      )}
      
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone || 'N/A'}</td>
                  <td>
                    {editingRole?.userId === user._id ? (
                      <select
                        value={editingRole.role}
                        onChange={(e) => setEditingRole({ userId: user._id, role: e.target.value })}
                        onBlur={() => {
                          if (editingRole.role !== user.role) {
                            handleRoleChange(user._id, editingRole.role);
                          } else {
                            setEditingRole(null);
                          }
                        }}
                        className={styles.roleSelect}
                      >
                        <option value="customer">Customer</option>
                        <option value="shopOwner">Shop Owner</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={styles.roleBadge}>{user.role}</span>
                    )}
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.editButton}
                        onClick={() => setEditingRole({ userId: user._id, role: user.role })}
                        title="Edit Role"
                      >
                        <Edit />
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDeleteUser(user._id, user.name)}
                        title="Delete User"
                      >
                        <Delete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className={styles.noData}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.hasPrevPage}
            className={styles.paginationButton}
          >
            Previous
          </button>
          <span className={styles.paginationInfo}>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.hasNextPage}
            className={styles.paginationButton}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
