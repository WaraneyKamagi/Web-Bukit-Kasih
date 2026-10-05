const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

/**
 * Helper function to handle API responses and errors centrally.
 */
async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem('bukit_kasih_token');

  const headers = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-CSRF-Token': 'BK-CSRF-SECURE-V1',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    credentials: 'include',
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Read body once as text to prevent "body stream already read" errors
  const textData = await response.text();
  let data = null;

  if (textData) {
    try {
      data = JSON.parse(textData);
    } catch {
      // It's not valid JSON (e.g., HTML error page)
    }
  }

  if (!response.ok) {
    // Handle 401 Unauthorized (Expired or invalid token)
    if (response.status === 401) {
      localStorage.removeItem('bukit_kasih_token');
      localStorage.removeItem('bukit_kasih_user');
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }

    // If backend returned a standard JSON error object: {"error": "..."}
    if (data && (data.error || data.message)) {
      throw new Error(data.error || data.message);
    }

    // Fallback for non-JSON errors or empty bodies
    if (textData) {
      console.error(`Raw API Error (${response.status}):`, textData);
    }
    throw new Error(`Terjadi kesalahan pada server (${response.status}). Silakan coba lagi.`);
  }

  return data;
}

// ==========================================
// API Services
// ==========================================

export const destinationService = {
  getAll: () => fetchWithAuth('/destinations'),
  create: (data) => fetchWithAuth('/destinations', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchWithAuth(`/destinations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchWithAuth(`/destinations/${id}`, { method: 'DELETE' }),
};

export const activityService = {
  getAll: () => fetchWithAuth('/activities'),
  create: (data) => fetchWithAuth('/activities', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchWithAuth(`/activities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchWithAuth(`/activities/${id}`, { method: 'DELETE' }),
};

export const authService = {
  login: (credentials) => fetchWithAuth('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data) => fetchWithAuth('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => fetchWithAuth('/auth/profile'),
  logout: () => fetchWithAuth('/auth/logout', { method: 'POST' }),
};

export const bookmarkService = {
  getAll: () => fetchWithAuth('/bookmarks'),
  toggle: (activityId, title = '') => fetchWithAuth('/bookmarks/toggle', { method: 'POST', body: JSON.stringify({ activityId, title }) }),
  getStats: () => fetchWithAuth('/bookmarks/stats'),
};

export const reviewService = {
  getAll: () => fetchWithAuth('/reviews'),
  create: (data) => fetchWithAuth('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => fetchWithAuth(`/reviews/${id}`, { method: 'DELETE' }),
};

export const inquiryService = {
  getAll: () => fetchWithAuth('/inquiries'),
  getByUser: (email) => fetchWithAuth(`/inquiries/user/${email}`),
  create: (data) => fetchWithAuth('/inquiries', { method: 'POST', body: JSON.stringify(data) }),
  reply: (id, replyMessage) => fetchWithAuth(`/inquiries/${id}/reply`, { method: 'PUT', body: JSON.stringify({ reply: replyMessage }) }),
};

export const announcementService = {
  getActive: () => fetchWithAuth('/announcements/active'),
  update: (data) => fetchWithAuth('/announcements', { method: 'POST', body: JSON.stringify(data) }),
};

export const knowledgeService = {
  getAll: () => fetchWithAuth('/knowledge'),
  create: (data) => fetchWithAuth('/knowledge', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchWithAuth(`/knowledge/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchWithAuth(`/knowledge/${id}`, { method: 'DELETE' }),
};

export const chatService = {
  sendMessage: (message) => fetchWithAuth('/chat', { method: 'POST', body: JSON.stringify({ message }) }),
};

export const uploadService = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('bukit_kasih_token');
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-Token': 'BK-CSRF-SECURE-V1',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Gagal mengunggah gambar');
    }

    return response.json();
  }
};
