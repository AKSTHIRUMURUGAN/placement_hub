import { auth } from '@/lib/firebase/client';
import { onAuthStateChanged, User } from 'firebase/auth';
import toast from 'react-hot-toast';

class AuthManager {
  private static instance: AuthManager;
  private currentUser: User | null = null;
  private tokenRefreshTimer: NodeJS.Timeout | null = null;
  private authInitialized: boolean = false;
  private authPromise: Promise<User | null> | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializeAuth();
    }
  }

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private initializeAuth() {
    // Create a promise that resolves when auth is initialized
    this.authPromise = new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        this.currentUser = user;
        this.authInitialized = true;
        
        if (user) {
          this.setupTokenRefresh();
          // Store user info in localStorage for persistence
          localStorage.setItem('authUser', JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
          }));
        } else {
          this.clearTokenRefresh();
          localStorage.removeItem('idToken');
          localStorage.removeItem('authUser');
        }
        
        // Resolve the promise with the user
        resolve(user);
        unsubscribe(); // Only need this for initial auth check
      });
    });

    // Continue listening for auth changes after initialization
    onAuthStateChanged(auth, (user) => {
      if (this.authInitialized) {
        this.currentUser = user;
        if (user) {
          this.setupTokenRefresh();
        } else {
          this.clearTokenRefresh();
          localStorage.removeItem('idToken');
          localStorage.removeItem('authUser');
        }
      }
    });
  }

  private setupTokenRefresh() {
    // Clear existing timer
    this.clearTokenRefresh();
    
    // Refresh token every 50 minutes (tokens expire in 1 hour)
    this.tokenRefreshTimer = setInterval(async () => {
      await this.refreshToken();
    }, 50 * 60 * 1000);

    // Also refresh token immediately
    this.refreshToken();
  }

  private clearTokenRefresh() {
    if (this.tokenRefreshTimer) {
      clearInterval(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
  }

  public async waitForAuthInitialization(): Promise<User | null> {
    if (this.authInitialized) {
      return this.currentUser;
    }
    return this.authPromise || Promise.resolve(null);
  }

  public async refreshToken(): Promise<string | null> {
    try {
      if (!this.currentUser) {
        return null;
      }

      const idToken = await this.currentUser.getIdToken(true); // Force refresh
      localStorage.setItem('idToken', idToken);
      
      // Set cookie for server-side access
      document.cookie = `authToken=${idToken}; path=/; max-age=3600; secure; samesite=strict`;
      
      return idToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      toast.error('Session expired. Please sign in again.');
      this.signOut();
      return null;
    }
  }

  public async getValidToken(): Promise<string | null> {
    try {
      // Wait for auth to initialize if it hasn't yet
      await this.waitForAuthInitialization();
      
      if (!this.currentUser) {
        // Check if we have stored auth info (page reload case)
        const storedUser = localStorage.getItem('authUser');
        const storedToken = localStorage.getItem('idToken');
        
        if (storedUser && storedToken) {
          // Try to use the stored token first
          return storedToken;
        }
        return null;
      }

      // Try to get current token first
      const idToken = await this.currentUser.getIdToken(false);
      localStorage.setItem('idToken', idToken);
      
      // Set cookie for server-side access
      document.cookie = `authToken=${idToken}; path=/; max-age=3600; secure; samesite=strict`;
      
      return idToken;
    } catch (error) {
      // If current token is invalid, force refresh
      console.log('Token invalid, refreshing...');
      return await this.refreshToken();
    }
  }

  public async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getValidToken();
    
    if (!token) {
      throw new Error('No valid authentication token');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    });

    // If we get 401, try refreshing token once
    if (response.status === 401) {
      const refreshedToken = await this.refreshToken();
      if (refreshedToken) {
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${refreshedToken}`,
          },
        });
      }
    }

    return response;
  }

  public signOut() {
    this.clearTokenRefresh();
    localStorage.removeItem('idToken');
    localStorage.removeItem('authUser');
    
    // Clear auth cookie
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    if (auth.currentUser) {
      auth.signOut();
    }
    window.location.href = '/sign-in';
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public getCurrentUserData(): any | null {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get user data from localStorage:', error);
      return null;
    }
  }

  public isAuthenticated(): boolean {
    // Check both current user and stored auth info
    if (this.currentUser) {
      return true;
    }
    
    // Check if we have stored auth info (for page reloads)
    const storedUser = localStorage.getItem('authUser');
    const storedToken = localStorage.getItem('idToken');
    
    return !!(storedUser && storedToken);
  }

  public async checkAuthStatus(): Promise<boolean> {
    try {
      await this.waitForAuthInitialization();
      return this.isAuthenticated();
    } catch (error) {
      return false;
    }
  }
}

export const authManager = AuthManager.getInstance();
export default authManager;