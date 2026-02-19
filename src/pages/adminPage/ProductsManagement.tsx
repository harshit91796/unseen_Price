import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Delete, Visibility, VisibilityOff, Store, AttachMoney, Search, FilterList } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { getAdminProducts, updateProductStatus, deleteProduct, getCategories } from '../../Api';
import { useDebounce } from '../../hooks/useDebounce';
import { Slider } from '@mui/material';
import styles from './AdminDashboard.module.css';

interface ShopInfo {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  shop?: ShopInfo;
  /** Populated shop object from API (backend uses shopId) */
  shopId?: ShopInfo & { address?: Record<string, string>; owner?: string };
  productCategory: string;
  genderCategory: string;
  stock: number;
  isAvailable: boolean;
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

interface ProductsResponse {
  data: Product[];
  pagination: Pagination;
}

const ProductsManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
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
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [filters, setFilters] = useState({
    category: '',
    productCategory: '',
    genderCategory: '',
    shop: '',
    isActive: '',
    isAvailable: '',
    city: '',
    state: '',
    dateFrom: '',
    dateTo: '',
    minPrice: '',
    maxPrice: '',
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
    if (filters.category) {
      params.append('category', filters.category);
    }
    if (filters.productCategory) {
      params.append('productCategory', filters.productCategory);
    }
    if (filters.genderCategory) {
      params.append('genderCategory', filters.genderCategory);
    }
    if (filters.shop) {
      params.append('shop', filters.shop);
    }
    if (filters.isActive !== '') {
      params.append('isActive', filters.isActive);
    }
    if (filters.isAvailable !== '') {
      params.append('isAvailable', filters.isAvailable);
    }
    if (filters.city) {
      params.append('city', filters.city);
    }
    if (filters.state) {
      params.append('state', filters.state);
    }
    if (filters.dateFrom) {
      params.append('dateFrom', filters.dateFrom);
    }
    if (filters.dateTo) {
      params.append('dateTo', filters.dateTo);
    }
    if (filters.minPrice) {
      params.append('minPrice', filters.minPrice);
    }
    if (filters.maxPrice) {
      params.append('maxPrice', filters.maxPrice);
    }
    params.append('page', pagination.page.toString());
    params.append('limit', pagination.limit.toString());
    
    return params.toString();
  }, [debouncedSearch, filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchProducts();
  }, [buildQueryString]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const queryString = buildQueryString();
      const response: ProductsResponse = await getAdminProducts(queryString);
      setProducts(response.data || []);
      setPagination(response.pagination || pagination);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (productId: string, currentStatus: boolean) => {
    try {
      await updateProductStatus(productId, !currentStatus);
      toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update product status');
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!window.confirm(`Are you sure you want to delete product "${productName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteProduct(productId);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete product');
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePriceChange = (_event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as [number, number]);
  };

  const handlePriceChangeCommitted = (_event: React.SyntheticEvent | Event, newValue: number | number[]) => {
    const [min, max] = newValue as [number, number];
    setFilters(prev => ({
      ...prev,
      minPrice: min.toString(),
      maxPrice: max.toString()
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPriceRange([0, 100000]);
    setFilters({
      category: '',
      productCategory: '',
      genderCategory: '',
      shop: '',
      isActive: '',
      isAvailable: '',
      city: '',
      state: '',
      dateFrom: '',
      dateTo: '',
      minPrice: '',
      maxPrice: '',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (loading && products.length === 0) {
    return <div className={styles.loading}>Loading products...</div>;
  }

  return (
    <div className={styles.contentSection}>
      <h2>Product Management</h2>
      
      {/* Search and Filters */}
      <div className={styles.searchFiltersContainer}>
        <div className={styles.searchBar}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by product name..."
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
              <label>Product Category</label>
              <input
                type="text"
                placeholder="Product category"
                value={filters.productCategory}
                onChange={(e) => handleFilterChange('productCategory', e.target.value)}
                className={styles.filterInput}
              />
            </div>
            <div className={styles.filterGroup}>
              <label>Gender Category</label>
              <select
                value={filters.genderCategory}
                onChange={(e) => handleFilterChange('genderCategory', e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">All</option>
                <option value="mens">Men's</option>
                <option value="womens">Women's</option>
                <option value="childrens">Children's</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>Shop</label>
              <input
                type="text"
                placeholder="Shop name"
                value={filters.shop}
                onChange={(e) => handleFilterChange('shop', e.target.value)}
                className={styles.filterInput}
              />
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
              <label>Availability</label>
              <select
                value={filters.isAvailable}
                onChange={(e) => handleFilterChange('isAvailable', e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">All</option>
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>
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
            <div className={styles.filterGroup} style={{ gridColumn: '1 / -1' }}>
              <label>Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}</label>
              <Slider
                value={priceRange}
                onChange={handlePriceChange}
                onChangeCommitted={handlePriceChangeCommitted}
                valueLabelDisplay="auto"
                min={0}
                max={100000}
                step={100}
                valueLabelFormat={(value) => `₹${value}`}
                sx={{
                  width: '100%',
                  color: '#2563eb',
                }}
              />
            </div>
            <button className={styles.clearFiltersButton} onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>
      )}
      
      <div className={styles.productsGrid}>
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product._id} className={styles.productCard}>
              <div className={styles.productImageContainer}>
                {product.images && Array.isArray(product.images) && product.images.length > 0 ? (
                  <img src={product.images[0]} alt={product.name || 'Product'} className={styles.productImage} />
                ) : (
                  <div className={styles.productImagePlaceholder}>
                    <ShoppingBag />
                  </div>
                )}
                <div className={`${styles.productStatusBadge} ${product.isAvailable ? styles.available : styles.unavailable}`}>
                  {product.isAvailable ? 'Available' : 'Unavailable'}
                </div>
              </div>
              
              <div className={styles.productInfo}>
                <h3>{product.name || 'Unnamed Product'}</h3>
                <p className={styles.productDescription}>{product.description || 'No description available'}</p>
                
                <div className={styles.productDetails}>
                  <div className={styles.productDetailItem}>
                    <AttachMoney className={styles.detailIcon} />
                    <span>₹{product.price ? product.price.toLocaleString() : '0'}</span>
                  </div>
                  <div className={styles.productDetailItem}>
                    <Store className={styles.detailIcon} />
                    <span>{product.shop?.name || product.shopId?.name || 'Unknown Shop'}</span>
                  </div>
                  <div className={styles.productDetailItem}>
                    <span>Category: {product.productCategory || 'No category'}</span>
                  </div>
                  <div className={styles.productDetailItem}>
                    <span>Gender: {product.genderCategory || 'N/A'}</span>
                  </div>
                  <div className={styles.productDetailItem}>
                    <span>Stock: {product.stock ?? 'N/A'}</span>
                  </div>
                  <div className={styles.productDetailItem}>
                    <span>Created: {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className={styles.productActions}>
                <button
                  className={`${styles.statusButton} ${product.isAvailable ? styles.deactivateButton : styles.activateButton}`}
                  onClick={() => handleStatusToggle(product._id, product.isAvailable)}
                  title={product.isAvailable ? 'Deactivate Product' : 'Activate Product'}
                >
                  {product.isAvailable ? <VisibilityOff /> : <Visibility />}
                  <span>{product.isAvailable ? 'Deactivate' : 'Activate'}</span>
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDeleteProduct(product._id, product.name)}
                  title="Delete Product"
                >
                  <Delete />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noData}>No products found</div>
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

export default ProductsManagement;
