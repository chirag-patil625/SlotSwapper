const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('auth-token');
};

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'auth-token': token }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.errors?.[0]?.msg || 'Something went wrong');
  }

  return data;
}

// Auth API
export const authAPI = {
  signup: async (name: string, email: string, password: string) => {
    return apiCall('/auth/createuser', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  login: async (email: string, password: string) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getUser: async () => {
    return apiCall('/auth/getuser', { method: 'POST' });
  },
};

// Events API
export const eventsAPI = {
  getAll: async () => {
    return apiCall('/events');
  },

  create: async (eventData: {
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    participants?: string[];
    category?: string;
  }) => {
    return apiCall('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  update: async (id: string, eventData: any) => {
    return apiCall(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/events/${id}`, { method: 'DELETE' });
  },

  toggleSwappable: async (id: string) => {
    return apiCall(`/events/${id}/toggle-swappable`, { method: 'PATCH' });
  },
};

// Swap API
export const swapAPI = {
  getSwappableSlots: async () => {
    return apiCall('/swappable-slots');
  },

  getMySwappableSlots: async () => {
    return apiCall('/my-swappable-slots');
  },

  createSwapRequest: async (mySlotId: string, theirSlotId: string) => {
    return apiCall('/swap-request', {
      method: 'POST',
      body: JSON.stringify({ mySlotId, theirSlotId }),
    });
  },

  getIncomingRequests: async () => {
    return apiCall('/swap-requests/incoming');
  },

  getOutgoingRequests: async () => {
    return apiCall('/swap-requests/outgoing');
  },

  respondToRequest: async (requestId: string, accept: boolean) => {
    return apiCall(`/swap-response/${requestId}`, {
      method: 'POST',
      body: JSON.stringify({ accept }),
    });
  },

  cancelRequest: async (requestId: string) => {
    return apiCall(`/swap-request/${requestId}`, { method: 'DELETE' });
  },
};
