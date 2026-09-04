import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Token ${import.meta.env.VITE_API_TOKEN}`,
  },
});

apiClient.interceptors.response.use(
  (res) => res.data,
  (err) => {
    console.warn("[API]", err.message);
    return Promise.reject(err);
  },
);

export { BASE_URL, WS_URL };
