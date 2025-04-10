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
    if (!token) return;
    console.log("[auth] 🚪 Logging out...");
    try {
      await api.post("/logout");
    } catch {
      console.warn("[auth] ⚠️ Logout request failed");
    } finally {
      setUser(null);
      setToken(null);
      setIsLoggedIn(false);
    }
  };
  

  useEffect(() => {
    const fetchMe = async () => {
      console.log("[auth] 🔄 Fetching /me...");
      try {
        const response = await api.get("/me");
        console.log("[auth] ✅ /me success:", response.data);
  
        setToken(response.data.token);
        setUser(response.data.User);
        setIsLoggedIn(true);
      } catch (err) {
        console.warn("[auth] ❌ /me failed – calling logOut()");
        logOut();
      }
    };
    fetchMe();
  }, []);
  

  useLayoutEffect(() => {
    const authInterceptor = api.interceptors.request.use((config) => {
      const cfg = config as CustomAxiosRequestConfig;
  
      if (!cfg._retry && token) {
        cfg.headers.Authorization = `Bearer ${token}`;
        console.log(`[auth] 📨 Added Authorization header to ${cfg.url}`);
      }
  
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
        const originalRequest = error.config as CustomAxiosRequestConfig;
  
        if (
          error.response.status === 403 &&
          error.response.data.message === "Unauthorized" &&
          !originalRequest._retry &&
          originalRequest.url !== "/refreshToken"
        ) {
          console.warn("[auth] 🔁 Got 403 – trying refreshToken...");
  
          try {
            const response = await api.get("/refreshToken");
            console.log("[auth] ✅ /refreshToken success");
  
            setToken(response.data.accessToken);
            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
            originalRequest._retry = true;
  
            return api(originalRequest);
          } catch (err) {
            console.warn("[auth] ❌ /refreshToken failed – logging out");
            logOut();
            return Promise.reject(err);
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
