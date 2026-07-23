import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach JWT Token from localStorage
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle Token Expiration (401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Do not redirect on authentication login attempts
            if (error.config?.url?.includes('/auth/login')) {
                return Promise.reject(error);
            }

            // Token is expired, invalid, or missing
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            const currentPath = window.location.pathname;

            // Do not redirect if already on a login or home page
            if (currentPath === '/super-admin/login' || currentPath === '/company-admin/login' || currentPath === '/home' || currentPath === '/register') {
                return Promise.reject(error);
            }
            
            // Redirect to appropriate login page on session expiry
            if (currentPath.startsWith('/admin')) {
                window.location.href = '/super-admin/login?expired=true';
            } else if (currentPath.startsWith('/recruiter')) {
                window.location.href = '/company-admin/login?expired=true';
            } else {
                window.location.href = '/home?expired=true';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
