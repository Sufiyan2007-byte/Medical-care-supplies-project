import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe, logout as logoutRequest } from '../services/authService';

const AuthContext = createContext(null);

/**
 * AuthProvider — Global Authentication Context Provider.
 *
 * Manages user session state, localStorage persistence,
 * initial token validation (/api/auth/me), and server-side logout.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || null);
  const [user, setUser]   = useState(() => {
    const saved = localStorage.getItem('auth_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Validate token & sync profile on initial load
  useEffect(() => {
    async function initAuth() {
      const savedToken = localStorage.getItem('auth_token');
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await getMe(savedToken);
        setUser(res.user);
        localStorage.setItem('auth_user', JSON.stringify(res.user));
      } catch (err) {
        // Token invalid, expired, or revoked (e.g. 401)
        console.warn('[AuthProvider] Session expired or invalid token:', err.message);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    const currentToken = localStorage.getItem('auth_token');
    if (currentToken) {
      try {
        await logoutRequest(currentToken);
      } catch (err) {
        console.error('[AuthProvider] Logout request error:', err.message);
      }
    }

    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  }, []);

  /** Update the cached user (e.g. after editing the profile). */
  const updateUser = useCallback((nextUser) => {
    localStorage.setItem('auth_user', JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const value = {
    token,
    user,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuthContext — Hook to consume global AuthContext state.
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

