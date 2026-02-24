import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import {
  Dashboard, People, ShoppingBag, Store, 
  Campaign, ShowChart, Settings, ExitToApp,
  Add, Delete, Edit, Search,
  Visibility,
  VisibilityOff,
  FilterList
} from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './AdminDashboard.module.css';
import { getAdvertisements, logout, updateAdvertisement } from '../../Api';
import AdvertiseForm from './AdvertiseForm';
import UsersManagement from './UsersManagement';
import ShopsManagement from './ShopsManagement';
import ProductsManagement from './ProductsManagement';


interface MenuItem {
  icon: React.ReactNode;
  label: string;
  value: string;
}

interface Advertisement {
  _id: string;
  title: string;
  description: string;
  images: string[];
  targeting: {
    coordinates: [number, number];
    city: string;
    state: string;
    country: string;
    radius: number;
    targetType: 'CITY' | 'STATE' | 'GLOBAL';
  };
  startDate: string;
  endDate: string;
  state?: string;
  city?: string;
  status?: 'active' | 'inactive';
  isActive: boolean;
  isDeleted: boolean;
  link?: string;
}

const menuItems: MenuItem[] = [
  { icon: <Dashboard />, label: 'Dashboard', value: 'dashboard' },
  { icon: <People />, label: 'Users', value: 'users' },
  { icon: <Store />, label: 'Shops', value: 'shops' },
  { icon: <ShoppingBag />, label: 'Products', value: 'products' },
  { icon: <Campaign />, label: 'Advertisements', value: 'ads' },
  { icon: <ShowChart />, label: 'Sales Analytics', value: 'analytics' },
  { icon: <Settings />, label: 'Settings', value: 'settings' },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdForm, setShowAdForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [adSearchQuery, setAdSearchQuery] = useState('');
  const [showAdFilters, setShowAdFilters] = useState(false);
  const [adFilters, setAdFilters] = useState({
    targetType: '',
    status: '',
    city: '',
    state: '',
    dateFrom: '',
    dateTo: '',
  });
  const [adPagination, setAdPagination] = useState({
    page: 1,
    limit: 20,
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalShops: 0,
    totalProducts: 0,
    totalSales: 0
  });

  const debouncedAdSearch = useDebounce(adSearchQuery, 500);

  const buildAdQueryString = useCallback(() => {
    const params = new URLSearchParams();
    
    if (debouncedAdSearch.trim()) {
      params.append('search', debouncedAdSearch.trim());
    }
    if (adFilters.targetType) {
      params.append('targetType', adFilters.targetType);
    }
    if (adFilters.status) {
      params.append('status', adFilters.status);
    }
    if (adFilters.city) {
      params.append('city', adFilters.city);
    }
    if (adFilters.state) {
      params.append('state', adFilters.state);
    }
    if (adFilters.dateFrom) {
      params.append('dateFrom', adFilters.dateFrom);
    }
    if (adFilters.dateTo) {
      params.append('dateTo', adFilters.dateTo);
    }
    params.append('page', adPagination.page.toString());
    params.append('limit', adPagination.limit.toString());
    
    return params.toString();
  }, [debouncedAdSearch, adFilters, adPagination.page, adPagination.limit]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeSection === 'ads') {
      fetchAdvertisements();
    }
  }, [buildAdQueryString, activeSection]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setStats({
        totalUsers: 1250,
        totalShops: 85,
        totalProducts: 3420,
        totalSales: 15800
      });
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvertisements = async () => {
    try {
      const queryString = buildAdQueryString();
      const response = await getAdvertisements(queryString);
      // Handle both array response and paginated response
      if (Array.isArray(response)) {
        setAdvertisements(response);
      } else if (response.data && Array.isArray(response.data)) {
        setAdvertisements(response.data);
      } else {
        console.error('Unexpected response format:', response);
        setAdvertisements([]);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch advertisements');
      setAdvertisements([]);
    }
  };

  const handleEditAd = (ad: Advertisement) => {
    setEditingAd(ad);
    setShowAdForm(true);
  };

  const handleDeleteAd = async (id: string) => {
    try {
      await updateAdvertisement(id, { isDeleted: true });
      toast.success('Advertisement deleted successfully');
      fetchAdvertisements();
    } catch (err) {
      toast.error('Failed to delete advertisement');
    }
  };

  const handleAdFormClose = () => {
    setShowAdForm(false);
    setEditingAd(null);
  };

  const handleAdFormSuccess = () => {
    setEditingAd(null);
    setShowAdForm(false);
    fetchAdvertisements();
  };

  const handleViewAd = async (id: string , isActive: boolean) => {
    console.log('View ad with ID:', id);
    const response = await updateAdvertisement(id ,{isActive : !isActive});
    if(response){
      toast.success('Advertisement activated successfully');
      fetchAdvertisements();
    }else{
      toast.error('Failed to activate advertisement');
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('adminToken');
    await logout();
    navigate('/admin/login');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className={styles.dashboardGrid}>
            <div className={styles.statsCard}>
              <People className={styles.statsIcon} />
              <div className={styles.statsInfo}>
                <h3>Total Users</h3>
                <p>{stats.totalUsers.toLocaleString()}</p>
              </div>
            </div>
            <div className={styles.statsCard}>
              <Store className={styles.statsIcon} />
              <div className={styles.statsInfo}>
                <h3>Total Shops</h3>
                <p>{stats.totalShops.toLocaleString()}</p>
              </div>
            </div>
            <div className={styles.statsCard}>
              <ShoppingBag className={styles.statsIcon} />
              <div className={styles.statsInfo}>
                <h3>Total Products</h3>
                <p>{stats.totalProducts.toLocaleString()}</p>
              </div>
            </div>
            <div className={styles.statsCard}>
              <ShowChart className={styles.statsIcon} />
              <div className={styles.statsInfo}>
                <h3>Total Sales</h3>
                <p>₹{stats.totalSales.toLocaleString()}</p>
              </div>
            </div>
          </div>
        );

      case 'users':
        return <UsersManagement />;

      case 'shops':
        return <ShopsManagement />;

      case 'products':
        return <ProductsManagement />;

      case 'ads':
        return (
          <div className={styles.contentSection}>
            <h2>Advertisement Management</h2>
            <div className={styles.adControls}>
              <button className={styles.addButton} onClick={() => setShowAdForm(true)}>
                <Add /> Create New Ad
              </button>
            </div>
            
            {/* Search and Filters */}
            <div className={styles.searchFiltersContainer}>
              <div className={styles.searchBar}>
                <Search className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search by advertisement title..."
                  value={adSearchQuery}
                  onChange={(e) => setAdSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <button
                className={styles.filterToggleButton}
                onClick={() => setShowAdFilters(!showAdFilters)}
              >
                <FilterList />
                Filters {showAdFilters ? '▲' : '▼'}
              </button>
            </div>

            {showAdFilters && (
              <div className={styles.filtersPanel}>
                <div className={styles.filterRow}>
                  <div className={styles.filterGroup}>
                    <label>Target Type</label>
                    <select
                      value={adFilters.targetType}
                      onChange={(e) => {
                        setAdFilters(prev => ({ ...prev, targetType: e.target.value }));
                        setAdPagination(prev => ({ ...prev, page: 1 }));
                      }}
                      className={styles.filterSelect}
                    >
                      <option value="">All Types</option>
                      <option value="CITY">City</option>
                      <option value="STATE">State</option>
                      <option value="GLOBAL">Global</option>
                    </select>
                  </div>
                  <div className={styles.filterGroup}>
                    <label>Status</label>
                    <select
                      value={adFilters.status}
                      onChange={(e) => {
                        setAdFilters(prev => ({ ...prev, status: e.target.value }));
                        setAdPagination(prev => ({ ...prev, page: 1 }));
                      }}
                      className={styles.filterSelect}
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className={styles.filterGroup}>
                    <label>City</label>
                    <input
                      type="text"
                      placeholder="City"
                      value={adFilters.city}
                      onChange={(e) => {
                        setAdFilters(prev => ({ ...prev, city: e.target.value }));
                        setAdPagination(prev => ({ ...prev, page: 1 }));
                      }}
                      className={styles.filterInput}
                    />
                  </div>
                  <div className={styles.filterGroup}>
                    <label>State</label>
                    <input
                      type="text"
                      placeholder="State"
                      value={adFilters.state}
                      onChange={(e) => {
                        setAdFilters(prev => ({ ...prev, state: e.target.value }));
                        setAdPagination(prev => ({ ...prev, page: 1 }));
                      }}
                      className={styles.filterInput}
                    />
                  </div>
                  <div className={styles.filterGroup}>
                    <label>Date From</label>
                    <input
                      type="date"
                      value={adFilters.dateFrom}
                      onChange={(e) => {
                        setAdFilters(prev => ({ ...prev, dateFrom: e.target.value }));
                        setAdPagination(prev => ({ ...prev, page: 1 }));
                      }}
                      className={styles.filterInput}
                    />
                  </div>
                  <div className={styles.filterGroup}>
                    <label>Date To</label>
                    <input
                      type="date"
                      value={adFilters.dateTo}
                      onChange={(e) => {
                        setAdFilters(prev => ({ ...prev, dateTo: e.target.value }));
                        setAdPagination(prev => ({ ...prev, page: 1 }));
                      }}
                      className={styles.filterInput}
                    />
                  </div>
                  <button
                    className={styles.clearFiltersButton}
                    onClick={() => {
                      setAdSearchQuery('');
                      setAdFilters({ targetType: '', status: '', city: '', state: '', dateFrom: '', dateTo: '' });
                      setAdPagination(prev => ({ ...prev, page: 1 }));
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
            
            <div className={styles.adList}>
              {advertisements && advertisements.length > 0 ? (
                advertisements
                  .filter((ad: Advertisement) => ad.isDeleted === false)
                  .map((ad: Advertisement) => (
                    <div key={ad._id} className={styles.adCard}>
                      <img 
                        src={ad.images && ad.images.length > 0 ? ad.images[0] : 'https://via.placeholder.com/300'} 
                        alt={ad.title} 
                        className={styles.adImage} 
                      />
                      <div className={styles.adInfo}>
                        <h3>{ad.title}</h3>
                        <p>{ad.description}</p>
                        <div className={styles.adMeta}>
                          <span>Location: {ad.targeting?.city || 'N/A'}, {ad.targeting?.state || 'N/A'}</span>
                          <span>Status: {
                            new Date(ad.endDate) < new Date() ? 'Expired' : 'Active' 
                          }</span>
                        </div>
                        <div className={styles.adDates}>
                          <span>From: {new Date(ad.startDate).toLocaleDateString()}</span>
                          <span>To: {new Date(ad.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className={styles.adActions}>
                        <button className={styles.editButton} onClick={() => handleEditAd(ad)}><Edit /></button>
                        <button className={styles.deleteButton} onClick={() => handleDeleteAd(ad._id)}><Delete /></button>
                        <button className={styles.viewButton} onClick={() => handleViewAd(ad._id , ad.isActive)}>
                          {ad.isActive === true ? <Visibility /> : <VisibilityOff />}
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className={styles.noData}>
                  <p>No advertisements found</p>
                </div>
              )}
            </div>
            {showAdForm && (
              <AdvertiseForm 
                initialAd={editingAd}
                onClose={handleAdFormClose}
                onSuccess={handleAdFormSuccess}
              />
            )}
          </div>
        );

      case 'analytics':
        return (
          <div className={styles.contentSection}>
            <h2>Sales Analytics</h2>
            <p>Analytics dashboard coming soon...</p>
          </div>
        );

      case 'settings':
        return (
          <div className={styles.contentSection}>
            <h2>Settings</h2>
            <p>Settings panel coming soon...</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <ToastContainer />
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1>Admin Panel</h1>
        </div>
        
        <nav className={styles.navigation}>
          {menuItems.map((item) => (
            <button
              key={item.value}
              className={`${styles.navButton} ${activeSection === item.value ? styles.active : ''}`}
              onClick={() => setActiveSection(item.value)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button className={styles.logoutButton} onClick={handleLogout}>
          <ExitToApp />
          <span>Logout</span>
        </button>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.searchBar}>
            <Search />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : (
            renderContent()
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;