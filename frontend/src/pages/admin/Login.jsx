import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';

const Login = () => {
    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [validationError, setValidationError] = useState('');
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionExpired, setSessionExpired] = useState(false);

    useEffect(() => {
        if (user) {
            const roleClean = user.role.replace('ROLE_', '');
            if (roleClean === 'ADMIN') {
                navigate('/admin/dashboard');
            }
        }
    }, [user, navigate]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('expired') === 'true') {
            setSessionExpired(true);
        }
    }, [location]);

    const validateForm = () => {
        if (!email) {
            setValidationError('Email is required.');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setValidationError('Please enter a valid email address.');
            return false;
        }
        if (!password) {
            setValidationError('Password is required.');
            return false;
        }
        setValidationError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        setSessionExpired(false);

        if (!validateForm()) return;

        setLoading(true);
        const result = await login(email, password);
        setLoading(false);

        if (result.success) {
            navigate('/admin/dashboard');
        } else {
            setApiError(result.message);
        }
    };

    return (
        <div className="auth-card-container">
            {/* Theme toggle in top right corner */}
            <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
                <ThemeToggle />
            </div>

            <div className="auth-card" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                <h2>Admin Login</h2>
                <p className="subtitle">Sign in to manage system users and settings</p>

                {sessionExpired && (
                    <div className="alert alert-warning">
                        Your session has expired. Please log in again.
                    </div>
                )}

                {apiError && (
                    <div className="alert alert-danger">
                        {apiError}
                    </div>
                )}

                {validationError && (
                    <div className="alert alert-danger">
                        {validationError}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            placeholder="admin@ats.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-block"
                        style={{ backgroundColor: '#ef4444', color: '#fff' }}
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
