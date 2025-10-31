import axios from 'axios';

// Replace with your actual backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const user = localStorage.getItem('user');
  if (user) {
    const token = JSON.parse(user).token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth APIs
export const authAPI = {
  login: (email: string, password: string, role: string) => 
    api.post('/login', { email, password, role }),
  
  signup: (email: string, password: string, name: string, role: string) => 
    api.post('/signup', { email, password, name, role }),
};

// Shipment APIs
export const shipmentAPI = {
  // Admin: Create new shipment
  createShipment: (data: any) => 
    api.post('/createShipment', data),
  
  // Admin: Get all shipments
  getAllShipments: () => 
    api.get('/shipments'),
  
  // Agent: Get assigned shipments
  getAgentShipments: (agentId: string) => 
    api.get(`/agentShipments/${agentId}`),
  
  // Customer: Get shipment by tracking ID
  getShipment: (trackingId: string) => 
    api.get(`/getShipment/${trackingId}`),
  
  // Agent: Update shipment status
  updateStatus: (shipmentId: string, status: string, location?: string) => 
    api.post('/updateStatus', { shipmentId, status, location }),
  
  // Agent: Upload proof of delivery
  uploadProof: (shipmentId: string, file: File) => {
    const formData = new FormData();
    formData.append('shipmentId', shipmentId);
    formData.append('proof', file);
    return api.post('/uploadProof', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  // Customer: Submit feedback
  submitFeedback: (shipmentId: string, rating: number, comments: string) => 
    api.post('/feedback', { shipmentId, rating, comments }),
};

// Analytics APIs
export const analyticsAPI = {
  getAdminStats: () => 
    api.get('/analytics/admin'),
};

export default api;
