// api.js
import { WORKER_API_URL } from './config.js';
import { supabase } from './supabaseClient.js';

/**
 * Helper to get current Auth Headers
 */
async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        throw new Error("No active session. User must be authenticated.");
    }
    return {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
    };
}

/**
 * Generic Worker API Fetcher
 */
export async function fetchWorkerApi(endpoint, options = {}) {
    const headers = await getAuthHeaders();
    const url = `${WORKER_API_URL}${endpoint}`;
    
    const response = await fetch(url, {
        ...options,
        headers: {
            ...headers,
            ...options.headers
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Worker API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
}

/**
 * Specific API Calls
 */
export async function getRecordings() {
    // The Worker will enforce the 7-day vs ALL recordings rule based on the JWT
    return fetchWorkerApi('/api/recordings');
}