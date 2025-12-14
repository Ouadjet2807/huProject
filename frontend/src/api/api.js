import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// small helper to read tokens
export const tokenStore = {
  getAccess: () => localStorage.getItem('accessToken'),
  getRefresh: () => localStorage.getItem('refreshToken'),
  setTokens: ({ access, refresh }) => {
    if (access) localStorage.setItem('accessToken', access);
    if (refresh) localStorage.setItem('refreshToken', refresh);
  },
  clear: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};



// attach access on every request (reads from localStorage in case of reload)
api.interceptors.request.use((config) => {

  const lang = localStorage.getItem("lang") || navigator.language || "fr";

  config.headers["Accept-Language"] = lang.split("-")[0];

  const token = tokenStore.getAccess();
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// simple mutex for refresh to avoid parallel refresh calls
let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(newToken) {
  refreshSubscribers.forEach(cb => cb(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb);
}

// response interceptor to handle 401 and refresh
api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // only handle 401 from our API (avoid infinite loops)
    if (error.response && error.response.status === 401) {
      originalRequest._retry = true;

      // if already refreshing, queue the request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((token) => {
            if (!token) return reject(error);
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;
      const refreshToken = tokenStore.getRefresh();
      if (!refreshToken) {
        isRefreshing = false;
        tokenStore.clear();
        return Promise.reject(error);
      }

      try {
        const resp = await axios.post(`${api.defaults.baseURL}/token/refresh/`, { refresh: refreshToken });
        const newAccess = resp.data.access;
        tokenStore.setTokens({ access: newAccess });
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`;
        onRefreshed(newAccess);
        isRefreshing = false;

        // retry original request
        originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshError) {
        // refresh failed -> clear tokens and reject
        console.log(refreshError);
        
        isRefreshing = false;
        tokenStore.clear();
        onRefreshed(null);
        window.location.reload()
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;