import {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";

import api from "../api/api";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const savedUser =
      localStorage.getItem("sams_user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    setLoading(false);

  }, []);

  const login = async (credentials) => {

    const res =
      await api.post(
        "/auth/login",
        credentials
      );

    const userData =
      res.data.user;

    localStorage.setItem(
      "sams_user",
      JSON.stringify(userData)
    );

    if (res.data.accessToken) {
      localStorage.setItem(
        "token",
        res.data.accessToken
      );
    }

    setUser(userData);

    return userData;
  };

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload);
    return res.data;
  };

  const logout = () => {

    setUser(null);

    localStorage.removeItem("token");
    localStorage.removeItem("sams_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}