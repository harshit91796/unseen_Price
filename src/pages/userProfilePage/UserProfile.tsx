import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Edit, 
  Add, 
  Store, 
  Settings, 
  Analytics, 
  Email,
  Phone,
  TrendingUp,
  ShoppingBag,
  StoreMallDirectory,
  Category,
  CheckCircle,
  Cancel,
  Delete
} from '@mui/icons-material';
import './UserProfile.css';
import AddShopModal from './addShopModal/AddShopModal';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import { useSelector } from 'react-redux';
import { createShop, getCategories, getUser, updateShop } from '../../Api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { uploadImagesToSupabase } from '../../services/service';

interface UserData {
  data: {
    user: {
      name: string;
      email: string;
      phone: string;
    },
    shops: ShopData[];
  }
}

interface ShopData {
  _id: string;
  name: string;
  description: string;
  address: { 
    street: string; 
    city: string; 
    state: string; 
    zipCode: string; 
    country: string 
  };
  contact: { 
    phone: string; 
    email: string 
  };
  images: string[];
  openingTime: string;
  closingTime: string;
  category: {
    name: string;
    image: string;
  };
  isActive: boolean;
  isDeleted?: boolean;
  revenue?: string;
  orders?: number;
}

const UserProfile = () => {
  const user = useSelector((state: any) => state.user.user);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('shops');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; shopId: string | null; shopName: string }>({
    isOpen: false,
    shopId: null,
    shopName: '',
  });
  console.log("userData",userData);

  useEffect(() => {
    getUserData();
    getCategoriesFromServer();
  }, []);

  const getUserData = async () => {
    try {
      setLoading(true);
      const data = await getUser();
      setUserData(data);
    } catch (error) {
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const getCategoriesFromServer = async () => {
    try {
      const response = await getCategories();
      const list = Array.isArray(response)
        ? response
        : (response?.data && Array.isArray(response.data) ? response.data : []);
      setCategories(list);
    } catch (error) {
      toast.error('Failed to load categories');
      setCategories([]);
    }
  };

  const handleAddShop = async (shopData: Omit<ShopData, '_id'>) => {
    try {
      console.log("shopData from modal",shopData);
      if(shopData.images.length === 0){
        console.log("No images uploaded");
        toast.error('Please upload at least one image');
        return;
      }else{
        const imagesArray = await uploadImagesToSupabase(shopData.images);
        shopData.images = imagesArray;
      }
      
      const data = await createShop(shopData);
      if (data.success) {
        toast.success(data.message);
        setIsModalOpen(false);
        getUserData(); // Refresh the shops list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to create shop');
    }
  };

  const formatCurrency = (amount: string | undefined) => {
    const value = parseInt(amount || '0');
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleDeleteShop = async () => {
    if (!deleteConfirmModal.shopId) return;
    
    try {
      await updateShop(deleteConfirmModal.shopId, { isDeleted: true });
      toast.success('Shop deleted successfully');
      // Refresh shops list
      await getUserData();
      setDeleteConfirmModal({ isOpen: false, shopId: null, shopName: '' });
    } catch (error) {
      console.error('Failed to delete shop', error);
      toast.error('Failed to delete shop');
    }
  };

  const openDeleteConfirm = (shopId: string, shopName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirmModal({ isOpen: true, shopId, shopName });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Header Section */}
      <ToastContainer />
      <section className="profile-header">
        <div className="user-info">
          <div className="user-avatar">
            <img 
              src={user?.profilePic || "https://via.placeholder.com/100"} 
              alt={userData?.data.user.name} 
              className="profile-image"
            />
            <button onClick={()=> navigate('/setup/avatar')} className="edit-avatar-btn">
              <Edit />
            </button>
          </div>
          <div className="user-details">
            <h1>{userData?.data.user.name}</h1>
            <div className="user-contact">
              <p><Email /> {userData?.data.user.email}</p>
              <p><Phone /> {userData?.data.user.phone}</p>
            </div>
            <button className="edit-profile-btn">
              <Edit /> Edit Profile
            </button>
          </div>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <StoreMallDirectory className="stat-icon" />
            <div className="stat-info">
              <h3>Total Shops</h3>
              <p>{userData?.data.shops.length || 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <TrendingUp className="stat-icon" />
            <div className="stat-info">
              <h3>Total Revenue</h3>
              <p>₹127,000</p>
            </div>
          </div>
          <div className="stat-card">
            <ShoppingBag className="stat-icon" />
            <div className="stat-info">
              <h3>Total Orders</h3>
              <p>359</p>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <nav className="profile-nav">
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'shops' ? 'active' : ''}`}
            onClick={() => setActiveTab('shops')}
          >
            <Store /> My Shops
          </button>
          <button 
            className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <Analytics /> Analytics
          </button>
          <button 
            className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings /> Settings
          </button>
        </div>
      </nav>

      {/* Shops Grid */}
      <section className="shops-section">
        <div className="shops-header">
          <h2>My Shops</h2>
          <button 
            className="add-shop-btn"
            onClick={() => setIsModalOpen(true)}
          >
            <Add /> Add New Shop
          </button>
        </div>

        <div className="shops-grid">
          {userData?.data.shops
            .filter((shop: ShopData) => shop.isDeleted !== true)
            .map((shop: ShopData) => (
            <div key={shop._id} className="shop-card-wrapper">
              <Link 
                to={`/shop/${shop._id}`} 
                className="shop-card"
              >
                <div className={`shop-status ${shop.isActive ? 'active' : 'inactive'}`}>
                  {shop.isActive ? (
                    <>
                      <CheckCircle /> Active
                    </>
                  ) : (
                    <>
                      <Cancel /> Inactive
                    </>
                  )}
                </div>
                
                <div className="shop-image">
                  {shop.images[0] ? (
                    <img src={shop.images[0]} alt={shop.name} />
                  ) : (
                    <Store className="placeholder-icon" />
                  )}
                </div>

                <div className="shop-info">
                  <div className="shop-title">
                    <h3>{shop.name}</h3>
                    <div className="shop-category">
                      <Category />
                      {shop.category.name}
                    </div>
                  </div>
                </div>
              </Link>
              <button
                className="shop-delete-button"
                onClick={(e) => openDeleteConfirm(shop._id, shop.name, e)}
                aria-label={`Delete ${shop.name}`}
              >
                <Delete />
              </button>
            </div>
          ))}

          <button 
            className="add-shop-card"
            onClick={() => setIsModalOpen(true)}
          >
            <Add className="add-icon" />
            <p>Add New Shop</p>
          </button>
        </div>
      </section>

      <AddShopModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddShop}
        categories={categories}
      />

      <ConfirmationModal
        isOpen={deleteConfirmModal.isOpen}
        onClose={() => setDeleteConfirmModal({ isOpen: false, shopId: null, shopName: '' })}
        onConfirm={handleDeleteShop}
        title="Delete Shop"
        message={`Are you sure you want to delete "${deleteConfirmModal.shopName}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default UserProfile;
