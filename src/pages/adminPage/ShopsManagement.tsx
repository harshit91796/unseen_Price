import React, { useState, useEffect, useCallback } from 'react';
import { Store, Delete, Visibility, VisibilityOff, LocationOn, Search, FilterList } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { getAdminShops, updateShopStatus, deleteShop, getCategories } from '../../Api';
import { useDebounce } from '../../hooks/useDebounce';
import styles from './AdminDashboard.module.css';

interface ShopOwner {
  _id: string;
  name: string;
  email: string;
}

interface Shop {
  _id: string;
  name: string;
  description: string;
  images: string[];
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  owner: ShopOwner;
  category: {
    name: string;
    image: string;
  };
  isActive: boolean;
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

interface ShopsResponse {
  data: Shop[];
  pagination: Pagination;
}

const ShopsManagement: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    owner: '',
    city: '',
    state: '',
    category: '',
    isActive: '',
    dateFrom: '',
    dateTo: '',
  });

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(Array.isArray(response) ? response : response?.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    
    if (debouncedSearch.trim()) {
      params.append('search', debouncedSearch.trim());
    }
    if (filters.owner) {
      params.append('owner', filters.owner);
    }
    if (filters.city) {
      params.append('city', filters.city);
    }
    if (filters.state) {
      params.append('state', filters.state);
    }
    if (filters.category) {
      params.append('category', filters.category);
    }
    if (filters.isActive !== '') {
      params.append('isActive', filters.isActive);
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
    fetchShops();
  }, [buildQueryString]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const queryString = buildQueryString();
      const response: ShopsResponse = await getAdminShops(queryString);
      setShops(response.data || []);
      setPagination(response.pagination || pagination);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch shops');
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (shopId: string, currentStatus: boolean) => {
    try {
      await updateShopStatus(shopId, !currentStatus);
      toast.success(`Shop ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchShops();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update shop status');
    }
  };

  const handleDeleteShop = async (shopId: string, shopName: string) => {
    if (!window.confirm(`Are you sure you want to delete shop "${shopName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteShop(shopId);
      toast.success('Shop deleted successfully');
      fetchShops();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete shop');
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
    setFilters({ owner: '', city: '', state: '', category: '', isActive: '', dateFrom: '', dateTo: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (loading && shops.length === 0) {
    return <div className={styles.loading}>Loading shops...</div>;
  }

  return (
    <div className={styles.contentSection}>
      <h2>Shop Management</h2>
      
      {/* Search and Filters */}
      <div className={styles.searchFiltersContainer}>
        <div className={styles.searchBar}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by shop name..."
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
              <label>Owner</label>
              <input
                type="text"
                placeholder="Owner name or email"
                value={filters.owner}
                onChange={(e) => handleFilterChange('owner', e.target.value)}
                className={styles.filterInput}
              />
            </div>
            <div className={styles.filterGroup}>
              <label>City</label>
              <input
                type="text"
                placeholder="City"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className={styles.filterInput}
              />
            </div>
            <div className={styles.filterGroup}>
              <label>State</label>
              <input
                type="text"
                placeholder="State"
                value={filters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
                className={styles.filterInput}
              />
            </div>
            <div className={styles.filterGroup}>
              <label>Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">All Categories</option>
                {categories.map((cat: any) => (
                  <option key={cat._id || cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>Status</label>
              <select
                value={filters.isActive}
                onChange={(e) => handleFilterChange('isActive', e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
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
      
      <div className={styles.shopsGrid}>
        {shops.length > 0 ? (
          shops.map((shop) => (
            <div key={shop._id} className={styles.shopCard}>
              <div className={styles.shopImageContainer}>
                {shop.images && Array.isArray(shop.images) && shop.images.length > 0 ? (
                  <img src={shop.images[0]} alt={shop.name || 'Shop'} className={styles.shopImage} />
                ) : (
                  <div className={styles.shopImagePlaceholder}>
                    <Store />
                  </div>
                )}
                <div className={`${styles.shopStatusBadge} ${shop.isActive ? styles.active : styles.inactive}`}>
                  {shop.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              
              <div className={styles.shopInfo}>
                <h3>{shop.name || 'Unnamed Shop'}</h3>
                <p className={styles.shopDescription}>{shop.description || 'No description available'}</p>
                
                <div className={styles.shopDetails}>
                  <div className={styles.shopDetailItem}>
                    <LocationOn className={styles.detailIcon} />
                    <span>{shop.address?.city || 'N/A'}, {shop.address?.state || 'N/A'}</span>
                  </div>
                  <div className={styles.shopDetailItem}>
                    <Store className={styles.detailIcon} />
                    <span>{shop.category?.name || 'No category'}</span>
                  </div>
                  <div className={styles.shopDetailItem}>
                    <span>Owner: {shop.owner?.name || 'Unknown'}</span>
                  </div>
                  <div className={styles.shopDetailItem}>
                    <span>Created: {shop.createdAt ? new Date(shop.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className={styles.shopActions}>
                <button
                  className={`${styles.statusButton} ${shop.isActive ? styles.deactivateButton : styles.activateButton}`}
                  onClick={() => handleStatusToggle(shop._id, shop.isActive)}
                  title={shop.isActive ? 'Deactivate Shop' : 'Activate Shop'}
                >
                  {shop.isActive ? <VisibilityOff /> : <Visibility />}
                  <span>{shop.isActive ? 'Deactivate' : 'Activate'}</span>
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDeleteShop(shop._id, shop.name)}
                  title="Delete Shop"
                >
                  <Delete />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noData}>No shops found</div>
        )}
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

export default ShopsManagement;
