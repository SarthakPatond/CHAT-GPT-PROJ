import axios from 'axios';

const AUTH_STORAGE_KEY = 'chat_token';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'https://chat-gpt-proj.onrender.com';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL?.replace(/\/$/, '') || API_BASE_URL;

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(AUTH_STORAGE_KEY);
}

export function setAuthToken(token) {
  if (typeof window === 'undefined') return;

  if (token) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, token);
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

api.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function normalizeChat(chat) {
  if (!chat) return null;

  return {
    id: chat.id ?? chat._id,
    title: chat.title || 'New Chat',
    lastActivity: chat.lastActivity ?? null,
    user: chat.user ?? null,
  };
}
