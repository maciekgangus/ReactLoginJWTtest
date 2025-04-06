import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";

import api, { CustomAxiosRequestConfig } from "../api/api";

interface User {
  name: string;
  avatar: number;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  logOut: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setIsLoggedIn: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return authContext;
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const logOut = async () => {
    try {
      await api.post("/api/logout");
      setUser(null);
      setToken(null);
      setIsLoggedIn(false);
    } catch (err) {
      console.log("Wylogowywanie nieudane");
    }
  };

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await api.get("/api/me");
        setToken(response.data.token);
        setUser(response.data.User);
        setIsLoggedIn(true);
      } catch {
        logOut();
      }
    };
    fetchMe();
  }, []);

  useLayoutEffect(() => {
    const authInterceptor = api.interceptors.request.use((config) => {
      const cfg = config as CustomAxiosRequestConfig;
      cfg.headers.Authorization =
        !cfg._retry && token ? `Bearer ${token}` : cfg.headers.Authorization;
      return cfg;
    });

    return () => {
      api.interceptors.request.eject(authInterceptor);
    };
  }, [token]);

  useLayoutEffect(() => {
    const refreshInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response.status === 403 &&
          error.response.data.message == "Unauthorized"
        ) {
          try {
            const response = await api.get("/api/refreshToken");
            setToken(response.data.accessToken);

            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
            originalRequest._retry = true;

            return api(originalRequest);
          } catch {
            logOut();
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(refreshInterceptor);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ token, isLoggedIn, user, logOut, setUser, setToken, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
