import axios from 'axios';
import { getAccessToken, setAccessToken, getRefreshToken, clearTokens, getApiUrl } from '../storage';

let _baseUrl = 'http://localhost:8000';

export async function getBaseUrl(): Promise<string> {
  _baseUrl = await getApiUrl();
  return _baseUrl;
}

export async function refreshBaseUrl(): Promise<void> {
  _baseUrl = await getApiUrl();
  api.defaults.baseURL = `${_baseUrl}/api/v1`;
}

export const api = axios.create({
  baseURL: `${_baseUrl}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        await clearTokens();
        return Promise.reject(error);
      }

      const baseUrl = await getBaseUrl();

      try {
        const response = await axios.post(`${baseUrl}/api/v1/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token } = response.data;
        await setAccessToken(access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch {
        await clearTokens();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
