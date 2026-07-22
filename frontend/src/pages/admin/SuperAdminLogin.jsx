import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';

const SuperAdminLogin = () => {
    const { login, logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [validationError, setValidationError] = useState('');
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionExpired, setSessionExpired] = useState(false);

    useEffect(() => {
        document.title = "System Administrator Console";
        if (user) {
            const roleClean = user.role.replace('ROLE_', '');
            if (roleClean === 'ADMIN') {
                navigate('/admin/dashboard', { replace: true });
            }
        }
    }, [user, navigate]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('expired') === 'true') {
            setSessionExpired(true);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        setValidationError('');

        if (!email.trim()) {
            setValidationError('Admin email or username is required.');
            return;
        }
        if (!password) {
            setValidationError('Password is required.');
            return;
        }

        setLoading(true);
        const result = await login(email.trim(), password);
        setLoading(false);

        if (result.success) {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const roleClean = storedUser?.role?.replace('ROLE_', '');
            if (roleClean !== 'ADMIN') {
                logout();
                setApiError('Access Denied: You do not have Super Admin privileges.');
            } else {
                navigate('/admin/dashboard', { replace: true });
            }
        } else {
            setApiError(result.message);
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#0d1117',
            color: '#c9d1d9',
            padding: '2rem',
            position: 'relative'
        }}>
            <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
                <ThemeToggle />
            </div>

            <div className="card" style={{
                maxWidth: '400px',
                width: '100%',
                backgroundColor: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '16px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                borderTop: '4px solid #da3633'
            }}>
                <div className="card-body" style={{ padding: '2.5rem 2rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f0f6fc', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
                            System Administrator Console
                        </h2>
                        <p style={{ color: '#8b949e', fontSize: '0.85rem' }}>
                            Restricted access for system administrators
                        </p>
                    </div>

                    {sessionExpired && (
                        <div className="alert alert-warning" style={{ backgroundColor: 'rgba(210,153,34,0.15)', color: '#d29922', border: '1px solid rgba(210,153,34,0.3)', marginBottom: '1.25rem' }}>
                            Session expired. Please re-authenticate.
                        </div>
                    )}

                    {apiError && (
                        <div className="alert alert-danger" style={{ backgroundColor: 'rgba(248,81,73,0.15)', color: '#f85149', border: '1px solid rgba(248,81,73,0.3)', marginBottom: '1.25rem' }}>
                            {apiError}
                        </div>
                    )}

                    {validationError && (
                        <div className="alert alert-danger" style={{ backgroundColor: 'rgba(248,81,73,0.15)', color: '#f85149', border: '1px solid rgba(248,81,73,0.3)', marginBottom: '1.25rem' }}>
                            {validationError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                            <label className="form-label" htmlFor="email" style={{ color: '#c9d1d9', fontWeight: 600 }}>
                                Admin Email or Username
                            </label>
                            <input
                                type="text"
                                id="email"
                                className="form-control"
                                style={{ backgroundColor: '#0d1117', borderColor: '#30363d', color: '#f0f6fc' }}
                                placeholder="Enter admin credentials"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                            <label className="form-label" htmlFor="password" style={{ color: '#c9d1d9', fontWeight: 600 }}>
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                className="form-control"
                                style={{ backgroundColor: '#0d1117', borderColor: '#30363d', color: '#f0f6fc' }}
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-block"
                            style={{
                                backgroundColor: '#da3633',
                                color: '#ffffff',
                                fontWeight: 700,
                                padding: '0.8rem',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                            disabled={loading}
                        >
                            {loading ? 'Authenticating...' : 'Sign In as Super Admin'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminLogin;
