// auth.js
import { supabase } from './supabaseClient.js';

/**
 * Email + Password Login
 */
export async function signInWithEmail(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

/**
 * Google OAuth Login
 */
export async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
            redirectTo: window.location.origin + '/dashboard/' 
        }
    });
    if (error) throw error;
    return data;
}

/**
 * Email OTP: Send Code
 * (Requires Supabase Email Template to show a code instead of a magic link)
 */
export async function sendEmailOtp(email) {
    const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
            shouldCreateUser: true,
            emailRedirectTo: undefined // Prevent magic link fallback
        }
    });
    if (error) throw error;
    return data;
}

/**
 * Email OTP: Verify Code
 */
export async function verifyEmailOtp(email, token) {
    const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: token,
        type: 'email'
    });
    if (error) throw error;
    return data;
}

/**
 * Fetch User Profile from public.users table
 */
export async function getUserProfile(userId) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) throw error;
    return data;
}

/**
 * Initialize Session & Load Profile Globally
 * Must be called on every protected page load.
 */
export async function initializeAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        window.currentSession = session;
        try {
            window.currentUser = await getUserProfile(session.user.id);
        } catch (err) {
            console.error("Error fetching profile:", err);
            window.currentUser = null;
        }
    } else {
        window.currentSession = null;
        window.currentUser = null;
    }
    
    return { session: window.currentSession, user: window.currentUser };
}

/**
 * Redirect to login if not authenticated
 */
export function requireAuth() {
    if (!window.currentSession) {
        window.location.href = '/login/';
        return false;
    }
    return true;
}

/**
 * Logout
 */
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    window.location.href = '/login/';
}