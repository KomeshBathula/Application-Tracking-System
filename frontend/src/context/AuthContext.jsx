import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        if (storedUser && storedToken) {
            try {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
            } catch (e) {
                // Clear corrupt storage
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setToken(null);
                setUser(null);
            }
        } else {
            setUser(null);
            setToken(null);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data && response.data.success) {
                const { token: jwtToken, user: userDto } = response.data.data;
                localStorage.setItem('token', jwtToken);
                localStorage.setItem('user', JSON.stringify(userDto));
                setToken(jwtToken);
                setUser(userDto);
                return { success: true };
            } else {
                return { success: false, message: response.data.message || 'Login failed' };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Invalid email or password';
            return { success: false, message };
        }
    };

    const register = async (fullName, email, password, role, companyName = null, companyId = null) => {
        try {
            const response = await api.post('/auth/register', {
                fullName,
                email,
                password,
                role,
                companyName,
                companyId
            });
            if (response.data && response.data.success) {
                return { success: true };
            } else {
                return { success: false, message: response.data.message || 'Registration failed' };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            return { success: false, message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const updateUserInContext = (updatedUser) => {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, setUser: updateUserInContext }}>
            {children}
        </AuthContext.Provider>
    );
};
