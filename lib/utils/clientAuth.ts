// Client-side authentication utilities

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Try localStorage first
  let token = localStorage.getItem('idToken');
  if (token) return token;
  
  // Fallback to cookie
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  token = cookies.authToken;
  
  // If we found token in cookie but not in localStorage, sync them
  if (token && !localStorage.getItem('idToken')) {
    localStorage.setItem('idToken', token);
  }
  
  return token || null;
};

export const getAuthHeaders = (isFormData = false): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  
  // Only set Content-Type for non-FormData requests
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  // Check if the body is FormData
  const isFormData = options.body instanceof FormData;
  const authHeaders = getAuthHeaders(isFormData);
  
  // Properly merge headers
  const mergedHeaders: Record<string, string> = {
    ...authHeaders,
  };
  
  // Add any additional headers from options
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        mergedHeaders[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        mergedHeaders[key] = value;
      });
    } else {
      Object.assign(mergedHeaders, options.headers);
    }
  }
  
  const response = await fetch(url, {
    ...options,
    headers: mergedHeaders,
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error('Non-JSON response:', text);
    throw new Error('Server returned non-JSON response');
  }
  
  // Return the response object with json method for backward compatibility
  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    json: () => response.json(),
  };
};

// Auth manager for token refresh and user management
export const authManager = {
  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    const token = getAuthToken();
    const userData = this.getCurrentUserData();
    return (token && userData) ? { uid: userData.firebaseUid || 'current-user' } : null;
  },

  getCurrentUserData() {
    if (typeof window === 'undefined') return null;
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  async checkAuthStatus() {
    const token = getAuthToken();
    const userData = this.getCurrentUserData();
    
    // If we have both token and user data, we're authenticated
    if (token && userData) {
      return true;
    }
    
    // If we have a token but no user data, try to fetch user data
    if (token && !userData) {
      try {
        const response = await fetch('/api/students/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.data.student));
            return true;
          }
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    }
    
    return false;
  },

  isAuthenticated() {
    const token = getAuthToken();
    const userData = this.getCurrentUserData();
    return !!(token && userData);
  },

  async refreshToken() {
    // This would typically refresh the Firebase token
    // For now, we'll just verify the current token is valid
    const token = getAuthToken();
    if (!token) return false;
    
    try {
      // Verify token is still valid by making a test API call
      const response = await fetch('/api/students/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response.ok;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  },

  signOut() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('user');
    localStorage.removeItem('idToken');
    // Clear cookie with all possible paths and domains
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax';
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=strict';
  }
};