// mobile/utils/api.js - Versione Mobile Originale Funzionante
// Configurazione automatica dell'endpoint
const MACHINE_IP = '192.168.1.4';

// Array di possibili endpoints da testare
const POSSIBLE_ENDPOINTS = [
  `http://${MACHINE_IP}:3000/api`,
  'http://localhost:3000/api',
  'http://127.0.0.1:3000/api'
];

let WORKING_ENDPOINT = null;

// Timeout per le richieste (8 secondi)
const TIMEOUT = 8000;

// Test automatico per trovare l'endpoint funzionante
const findWorkingEndpoint = async () => {
  if (WORKING_ENDPOINT) return WORKING_ENDPOINT;
  
  console.log('🔍 Testing API endpoints...');
  
  for (const endpoint of POSSIBLE_ENDPOINTS) {
    try {
      console.log(`Testing: ${endpoint}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(endpoint.replace('/api', '/'), {
        signal: controller.signal,
        method: 'GET'
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`✅ Working endpoint found: ${endpoint}`);
        WORKING_ENDPOINT = endpoint;
        return endpoint;
      }
    } catch (error) {
      console.log(`❌ Failed: ${endpoint} - ${error.message}`);
    }
  }
  
  throw new Error('No working API endpoint found');
};

// Funzione helper per le richieste con timeout e fallback
const fetchWithTimeout = async (path, options = {}) => {
  const endpoint = await findWorkingEndpoint();
  const url = `${endpoint}${path.startsWith('/') ? path : '/' + path}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
  
  try {
    console.log(`🌐 Making request to: ${url}`);
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Server not responding (timeout)');
    }
    throw new Error(`Connection failed: ${error.message}`);
  }
};

const api = {
  // Auth endpoints
  register: async (userData) => {
    try {
      const response = await fetchWithTimeout('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || 'Registration failed' };
      }
      
      return await response.json();
    } catch (error) {
      console.error('Register error:', error);
      return { error: error.message };
    }
  },

  login: async (credentials) => {
    try {
      const response = await fetchWithTimeout('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || 'Login failed' };
      }
      
      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      return { error: error.message };
    }
  },

  // Orari endpoints
  getAvailableSlots: async () => {
    try {
      const response = await fetchWithTimeout('/orari');
      return response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  getAvailableWeeks: async () => {
    try {
      const response = await fetchWithTimeout('/orari/settimane');
      return response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  // Prenotazioni endpoints
  createBooking: async (bookingData) => {
    try {
      const response = await fetchWithTimeout('/prenotazioni', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      return response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  getUserBookings: async (userId) => {
    try {
      const response = await fetchWithTimeout(`/prenotazioni/user/${userId}`);
      return response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  getAllBookings: async () => {
    try {
      const response = await fetchWithTimeout('/prenotazioni/all');
      return response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  cancelBooking: async (bookingId) => {
    try {
      const response = await fetchWithTimeout(`/prenotazioni/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stato: 'cancellata' }),
      });
      return response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  clearAllBookings: async () => {
    try {
      const response = await fetchWithTimeout('/prenotazioni/clear-all', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.json();
    } catch (error) {
      return { error: error.message };
    }
  },

  // Test connectivity
  testConnection: async () => {
    try {
      const endpoint = await findWorkingEndpoint();
      return { success: true, endpoint };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

export default api;
