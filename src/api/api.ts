import axios, { InternalAxiosRequestConfig } from "axios";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: import.meta.env.API_URL,
  withCredentials: true,
});

export type { CustomAxiosRequestConfig }; // eksport opcjonalny
export default api;
