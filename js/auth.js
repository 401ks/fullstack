// js/auth.js
// Auth utilities: session guard, login, signup, logout, profile fetching

const Auth = {
  // Current user state (populated after auth check)
  currentUser: null,
  currentSession: null,

  /**
   * Require authentication — call on every protected page
   * Redirects to /login/ if no session
   */
  async requireAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (!session) {
      window.location.href = '/login/';
      return false;
    }

    this.currentSession = session;
    
    // Fetch user profile from Supabase
    const { data: profile, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      // If profile doesn't exist yet, create a basic one
      if (error.code === 'PGRST116') {
        const { data: newProfile } = await supabaseClient
          .from('users')
          .insert({
            id: session.user.id,
            email: session.user.email,
            subscription_type: 'basic',
            grade: null,
            subjects: []
          })
          .select()
          .single();
        this.currentUser = newProfile;
      } else {
        // Real error — sign out and redirect
        await supabaseClient.auth.signOut();
        window.location.href = '/login/';
        return false;
      }
    } else {
      this.currentUser = profile;
    }

    // Expose globally for other scripts
    window.currentUser = this.currentUser;
    window.currentSession = this.currentSession;
    
    // Dispatch custom event so other scripts can react
    window.dispatchEvent(new CustomEvent('auth:ready', { detail: this.currentUser }));
    
    return true;
  },

  /**
   * Login with email/password
   */
  async login(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign up new user
   */
  async signup(email, password, metadata = {}) {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: metadata // stored in auth.users.raw_user_meta_data
      }
    });

    if (error) throw error;

    // Create profile row in public.users table
    if (data.user) {
      const { error: profileError } = await supabaseClient
        .from('users')
        .insert({
          id: data.user.id,
          email: email,
          subscription_type: metadata.subscription_type || 'basic',
          grade: metadata.grade || null,
          subjects: metadata.subjects || []
        });

      if (profileError) console.error('Profile creation error:', profileError);
    }

    return data;
  },

  /**
   * Logout — clears session and redirects
   */
  async logout() {
    await supabaseClient.auth.signOut();
    window.location.href = '/login/';
  },

  /**
   * Get current session (non-blocking check)
   */
  async getSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    return session;
  },

  /**
   * Listen for auth state changes (login/logout events)
   */
  onAuthStateChange(callback) {
    return supabaseClient.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }
};

window.Auth = Auth;