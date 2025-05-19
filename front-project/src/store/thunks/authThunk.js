// authThunk.js
import { setLoading, setUser, logOutUser } from '../authSlice';
import { auth } from '../../api/auth';

export const verify2FA = ({ id, code }) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    // Llamada a la API de 2FA (AuthenticationCode)
    const response = await auth.AuthenticationCode({ id, code });

    if (response.token) {
      dispatch(setUser({
        isAuthenticated: true,
        token: response.token,
        role: response.role,
        permissions: response.permissions || [],
      }));
      localStorage.setItem('token', response.token);
    } else {
      dispatch(logOutUser());
      throw new Error(response.message || 'Código 2FA inválido');
    }
  } catch (error) {
    dispatch(logOutUser());
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};
