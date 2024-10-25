import axios from 'axios';

// Base URL for your API
const API_BASE_URL = 'https://fluoridated-silicon-birch.glitch.me/api';

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
    const token = localStorage.getItem('authToken');
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

export const fetchPosts = async () => {
  try {
    const response = await api.get('/post/feed');
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
