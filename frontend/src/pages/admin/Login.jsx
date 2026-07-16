import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
        document.title = "Admin Sign In - ATS";
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', padding: '2rem' }}>
            <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
                <ThemeToggle />
            </div>

            <div className="card" style={{ maxWidth: '400px', width: '100%', borderTop: '4px solid var(--danger-color)' }}>
                <div className="card-body" style={{ padding: '2.5rem 2rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--danger-light)', color: 'var(--danger-color)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' }}>▲</div>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.25rem' }}>Admin Control Center</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Sign in to manage system configurations</p>
                    </div>

                    {sessionExpired && (
                        <div className="alert alert-warning" style={{ padding: '0.75rem 1rem' }}>
                            Your session has expired. Please log in again.
                        </div>
                    )}

                    {apiError && (
                        <div className="alert alert-danger" style={{ padding: '0.75rem 1rem' }}>
                            {apiError}
                        </div>
                    )}

                    {validationError && (
                        <div className="alert alert-danger" style={{ padding: '0.75rem 1rem' }}>
                            {validationError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                className="form-control"
                                placeholder="admin@ats.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label className="form-label" htmlFor="password">Password</label>
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
                            style={{ backgroundColor: 'var(--danger-color)', color: '#fff' }}
                            disabled={loading}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
                        <Link to="/" style={{ color: 'var(--text-muted)' }}>← Back to selection</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
