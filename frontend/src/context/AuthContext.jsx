import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, profile as apiProfile } from '../api/authApi';
import Swal from 'sweetalert2';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { data } = await apiProfile(token);
        const cleaned = { ...data, role: data?.role?.toString().trim() };
        setUser(cleaned);
      } catch (e) {
        console.log(e);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const { data } = await apiLogin({ email, password });
      const cleanedUser = { ...data.user, role: data.user?.role?.toString().trim() };
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(cleanedUser);
      Swal.fire({ icon: 'success', title: 'Logged in', toast: true, position: 'top', timer: 1500, showConfirmButton: false });
      return cleanedUser;
    } catch (e) {
      Swal.fire({ icon: 'error', title: e.response?.data?.message || 'Login failed', toast: true, position: 'top' });
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setLoading(false);
    Swal.fire({ icon: 'success', title: 'Logged out', toast: true, position: 'top', timer: 1200, showConfirmButton: false });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}



