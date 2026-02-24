import axios from 'axios';

// Base URL for your API
// const API_BASE_URL = 'https://d31i0zfjth34gl.cloudfront.net/api'; 

// Local URL for development
const API_BASE_URL = 'http://localhost:3000/api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// API functions



export const sendMessage = async (chatId: string, content: string, fileUrl: string, fileType: string) => {
  console.log('API sendMessage function called with:', 'chatId:', chatId, 'content:', content, 'fileUrl:', fileUrl, 'fileType:', fileType);
  try {
    const response = await api.post('/convo/message', { chatId, content, mediaUrl: fileUrl, contentType: fileType });
    console.log('API sendMessage response:', response.data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('An unknown error occurred');
    }
    throw error;
  }
};

export const createConversation = async (participants: string[]) => {
  try {
    const response = await api.post('/conversations', { participants });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('An unknown error occurred');
    }
    throw error;
  }
};

export const updateConversation = async (conversationId: string, data: any) => {
  try {
    const response = await api.put(`/conversations/${conversationId}`, data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('An unknown error occurred');
    }
    throw error;
  }
};

export const deleteConversation = async (conversationId: string) => {
  try {
    const response = await api.delete(`/conversations/${conversationId}`);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('An unknown error occurred');
    }
    throw error;
  }
};

// Authentication functions
export const login = async (email: string, password: string) => {
  try {
    console.log('Sending login request to backend...');
    const response = await api.post('/auth/login', { email, password });
    console.log('Login response from backend:', response.data);
    console.log('Setting auth token in localStorage:', response.data.token);
    localStorage.setItem('authToken', response.data.token);
    return response.data; // This should include the user data
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('An unknown error occurred');
    }
    throw error;
  }
};

export const adminLogin = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/admin/login', { email, password });
    // Store admin token separately
    if (response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
    }
    return response.data; // Returns { data: { _id, name, email, role }, token }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Admin login error:', error.message);
    } else {
      console.error('An unknown error occurred during admin login');
    }
    throw error;
  }
};

export const register = async (userData: any) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('An unknown error occurred');
    }
    throw error;
  }
};

export const logout = async () => {
  try {
    // Call the backend logout endpoint if you have one
    // await api.post('/auth/logout');

    // Clear all auth-related data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    // Clear any cookies (if used)
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // You might want to clear the Redux store as well
    // This should be done where you call this logout function
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('An unknown error occurred');
    }
    throw error;
  }
};

export const getUser = async () => {
  try {
    const response = await api.get('/auth/get-User');
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};

export const createShop = async (shopData: {
  name: string;
  // location: {
  //   type: {
  //     type: string,
  //   },
  //   coordinates: {
  //     type: [Number], // [longitude, latitude]
  //   }
  // };
  description: string;
  images : [string];
  address: {
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string
  },
  contact: {
    phone: string,
    email: string
  },
  category: {
    name: string,
    image: string
  },
  openingTime: string,
  closingTime: string,
  // rating: {
  //   type: Number,
  //   default: 0
  // },
  isActive: boolean
}) => {
  try {
    const response = await api.post('/shop/create-shop', shopData);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('An unknown error occurred');
    }
    throw error;
  }
};

export const createPost = async (postData: {
  title: string;
  description: string;
  location: string;
  date: string;
  peopleNeeded: number;
}) => {
  try {
    const response = await api.post('/post/create-post', postData);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('An unknown error occurred');
    }
    throw error;
  }
};

export const updateUser = async ( userData: any) => {
  try {
    const response = await api.put(`/auth/update-user`, userData);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('An unknown error occurred');
    }
    throw error;
  } 
};

export default api;

// New API functions
export const getChats = async () => {
  try {
    const response = await api.get('/convo/getChats');
    console.log('API getChats response:', response.data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('An unknown error occurred');
    }
    throw error;
  }
};

export const getMessages = async (chatId: string) => {
  try {
    const response = await api.get(`/convo/getMessages/${chatId}`);
    console.log('API getMessages response:', response.data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('An unknown error occurred');
    }
    throw error;
  }
};

export const accessChat = async (userId: string) => {
  try {
    const response = await api.post('/convo/accessChat', { userId });
    console.log('API accessChat response:', response.data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('An unknown error occurred');
    }
    throw error;
  }
};

export const sendMessageRequest = async (receiverId: string, postId: string, message: string) => {
  console.log("request data", receiverId, postId, message)
  try {
    const response = await api.post('/convo/send-message-request', { receiverId, postId, message });
    console.log('API sendMessageRequest response:', response);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('An unknown error occurred');
    }
    throw error;
  }
};

export const getMessageRequest = async (requestId: string) => {
  try {
    const response = await api.post('/convo/message-request' , {requestId});
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('An unknown error occurred');
    }
    throw error;
  }
};

export const handleMessageRequest = async (requestId: string , action: string) => {
  try {
    const response = await api.post('/convo/handle-message-request', { requestId , action});
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('An unknown error occurred');
    }
    throw error;
  }
};

export const searchUsers = async (query: string) => {
  try {
    const response = await api.get(`/searchUsers?search=${query}`);
    console.log('API searchUsers response:', response.data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('An unknown error occurred');
    }
    throw error;
  }
};

export const sendOtp = async (phoneNumber: string) => {
  try {
    const response = await api.post('/auth/send-otp', { phoneNumber });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('An unknown error occurred');
    }
    throw error;
  }
};

export const verifyOtp = async (phoneNumber: string, otp: string) => {
  try {
    const response = await api.post('/auth/verify-otp', { phoneNumber, otp });
    localStorage.setItem('authToken', response.data.token);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('An unknown error occurred');
    }
    throw error;
  }
};


export const createProduct = async (productData: {
  name: string;
  description: string;
  price: number;
  productCategory: string;
  genderCategory: string;
  images: string[];
  stock: number;
  isAvailable: boolean;
  shopId: string;
  category: string;
}) => {
  try {
    const response = await api.post('/product/create-product', productData);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('An unknown error occurred');
    }
    throw error;
  }
};


// get details


export const getShopProducts = async (shopId: string) => {
  try {
    const response = await api.get(`/product/products/shop/${shopId}`);
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};

export const getShopDetails = async (shopId: string) => {
  try {
    const response = await api.get(`/shop/get-shop/${shopId}`);
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await api.get(`/shop/get-categories`);
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};


export const getProductDetails = async (productId: string) => {
  try {
    const response = await api.get(`/product/products/${productId}`);
    console.log("product details", response);
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};

export const updateProduct = async (productId: string, updatedData: any) => {
  try {
    const response = await api.put(`/product/update-product/${productId}`, updatedData);
    console.log('API updateProduct response:', response.data);
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};

export const searchProducts = async (query: string) => {
  try {
    const response = await api.get(`/product/filter?${query}`);
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};

export const searchShops = async (query: string) => {
  try {
    const response = await api.get(`/shop/filter?${query}`);
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};

// Wishlist APIs
export const addToWishlist = async (productId?: string, shopId?: string) => {
  try {
    const response = await api.post(
      `/userActivity/wishlist/add`,
      { productId, shopId },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    // handleApiError(error);
    throw error;
  }
};

export const removeFromWishlist = async (productId?: string, shopId?: string) => {
  try {
    const response = await api.post(
      `/userActivity/wishlist/remove`,
      { productId, shopId },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    // handleApiError(error);
    throw error;
  }
};

export const getWishlist = async () => {
  try {
    const response = await api.get(
      `/userActivity/wishlist`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    // handleApiError(error);
    throw error;
  }
};




//update

export const updateShop = async (shopId: string, updatedData: any) => {
  try {
    const response = await api.put(`/shop/update-shop/${shopId}`, updatedData);
    console.log('API updateShop response:', response.data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('An unknown error occurred');
    }
    throw error;
  }
};



// Advertisement APIs

export const createAdvertisement = async (advertisementData: any) => {
  try {
    const response = await api.post('/admin/advertisement/create', advertisementData);
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};


export const getAdvertisements = async (queryParams?: string) => {
  try {
    const url = queryParams ? `/admin/advertisement/all?${queryParams}` : '/admin/advertisement/all';
    const response = await api.get(url);
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};

/**
 * Public endpoint: location-based ads (nearby + global).
 * GET /api/admin/advertisement/nearby?longitude=&latitude=&state=&city=
 * Use when you have user location; works without params to return global ads.
 */
export const getAdvertisementNearby = async (params?: {
  longitude?: number;
  latitude?: number;
  state?: string;
  city?: string;
}) => {
  try {
    const search = new URLSearchParams();
    if (params?.longitude != null) search.set('longitude', String(params.longitude));
    if (params?.latitude != null) search.set('latitude', String(params.latitude));
    if (params?.state) search.set('state', params.state);
    if (params?.city) search.set('city', params.city);
    const qs = search.toString();
    const url = qs ? `/admin/advertisement/nearby?${qs}` : '/admin/advertisement/nearby';
    const response = await api.get(url);
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data?.data && Array.isArray(data.data)) return data.data;
    return [];
  } catch (error: unknown) {
    throw error;
  }
};

export const updateAdvertisement = async (advertisementId: string, updatedData: any) => {
  try {
    const response = await api.put(`/admin/advertisement/${advertisementId}`, updatedData);
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};

// Admin: Users APIs
export const getAdminUsers = async (queryParams?: string) => {
  try {
    const url = queryParams ? `/admin/users?${queryParams}` : '/admin/users';
    const response = await api.get(url);
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};

export const updateUserRole = async (userId: string, role: string) => {
  try {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};

// Admin: Shops APIs
export const getAdminShops = async (queryParams?: string) => {
  try {
    const url = queryParams ? `/admin/shops?${queryParams}` : '/admin/shops';
    const response = await api.get(url);
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};

export const updateShopStatus = async (shopId: string, isActive: boolean) => {
  try {
    const response = await api.put(`/admin/shops/${shopId}/status`, { isActive });
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};

export const deleteShop = async (shopId: string) => {
  try {
    const response = await api.delete(`/admin/shops/${shopId}`);
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};

// Admin: Products APIs
export const getAdminProducts = async (queryParams?: string) => {
  try {
    const url = queryParams ? `/admin/products?${queryParams}` : '/admin/products';
    const response = await api.get(url);
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};

export const updateProductStatus = async (productId: string, isActive: boolean) => {
  try {
    const response = await api.put(`/admin/products/${productId}/status`, { isActive });
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};


export const deleteProduct = async (productId: string) => {
  try {
    const response = await api.delete(`/admin/products/${productId}`);
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};

// Admin: Categories APIs
export const getAdminCategories = async () => {
  try {
    const response = await api.get('/admin/categories');
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};

export const createCategory = async (categoryData: { name: string; image?: string }) => {
  try {
    const response = await api.post('/admin/category', categoryData);
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};

export const updateCategory = async (categoryId: string, categoryData: { name?: string; image?: string }) => {
  try {
    const response = await api.put(`/admin/category/${categoryId}`, categoryData);
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};

export const deleteCategory = async (categoryId: string) => {
  try {
    const response = await api.delete(`/admin/category/${categoryId}`);
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};

// Admin: Advertisement Stats
export const getAdvertisementStats = async () => {
  try {
    const response = await api.get('/admin/advertisement/stats');
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};