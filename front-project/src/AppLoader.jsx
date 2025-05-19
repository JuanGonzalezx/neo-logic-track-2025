import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, logOutUser } from './redux/authSlice'; // Ajusta la ruta
import { getUserFromToken } from './api/auth'; // Ajusta la ruta

const AppLoader = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    async function loadUserData() {
      const token = localStorage.getItem('token');
      console.log("Token from localStorage:", token);
      if (!token) {
        dispatch(logOutUser());
        return;
      }

      try {
        console.log("Token:", token);
        const response = await getUserFromToken({ token });
        if (response && response.id && response.role && response.permissions) {
          dispatch(setUser({
            token, // use the token from localStorage
            isAuthenticated: true,
            role: response.role,
            permissions: response.permissions.map(p => typeof p === 'string' ? p : p.id),
          }));
          console.log("User data loaded:", response);
        } else {
          dispatch(logOutUser());
        }
      } catch (error) {
        dispatch(logOutUser());
      }
    }

    loadUserData();
  }, [dispatch]);

  return null; // No renderiza nada visible
};

export default AppLoader;
