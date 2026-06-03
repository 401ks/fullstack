// js/api.js
// Worker API helper — attaches Supabase JWT to all requests

const WORKER_BASE_URL = 'https://YOUR_WORKER_DOMAIN.workers.dev/api';

const Api = {
  /**
   * Get the current JWT token
   */
  async getToken() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    return session?.access_token || null;
  },

  /**
   * Authenticated fetch to Worker API
   * Automatically attaches Bearer token
   */
  async fetch(endpoint, options = {}) {
    const token = await this.getToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const url = `${WORKER_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        // Token expired or invalid — force re-auth
        await supabaseClient.auth.signOut();
        window.location.href = '/login/';
        return;
      }
      
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Fetch recordings (Worker enforces subscription rules)
   * @param {Object} filters - { subject, grade, days }
   */
  async getRecordings(filters = {}) {
    const params = new URLSearchParams();
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.grade) params.append('grade', filters.grade);
    if (filters.days) params.append('days', filters.days);
    
    const queryString = params.toString();
    const endpoint = `/recordings${queryString ? '?' + queryString : ''}`;
    
    return this.fetch(endpoint);
  },

  /**
   * Fetch classes (placeholder for future Worker integration)
   */
  async getClasses(filters = {}) {
    return this.fetch('/classes');
  },

  /**
   * Fetch user-specific data
   */
  async getProfile() {
    return this.fetch('/profile');
  }
};

window.Api = Api;