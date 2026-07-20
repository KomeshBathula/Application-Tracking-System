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
    const requestedLocation = location.state?.from;
    const returnPath = requestedLocation?.pathname?.startsWith('/recruiter/')
        ? `${requestedLocation.pathname}${requestedLocation.search || ''}${requestedLocation.hash || ''}`
        : '/recruiter/dashboard';

    useEffect(() => {
        document.title = "Recruiter Sign In - ATS";
        if (user) {
            const roleClean = user.role.replace('ROLE_', '');
            if (roleClean === 'RECRUITER') {
                navigate(returnPath, { replace: true });
            }
        }
    }, [user, navigate, returnPath]);

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
            navigate(returnPath, { replace: true });
        } else {
            setApiError(result.message);
        }
    };

    return (
        <div className="auth-split-container">
            {/* Split Sidebar panel */}
            <div className="auth-split-sidebar" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div style={{ maxWidth: '400px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '1.25rem', marginBottom: '4rem' }}>
                        <div className="sidebar-brand-icon" style={{ width: '32px', height: '32px', fontSize: '0.9rem', backgroundColor: 'var(--success-color)' }}>▲</div>
                        <span style={{ color: 'var(--text-primary)' }}>ATS Portal</span>
                    </div>
                    
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                        Scale your team with advanced hiring tools.
                    </h2>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <span style={{ color: 'var(--success-color)', fontSize: '1.1rem', fontWeight: 'bold' }}>✓</span>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Publish jobs dynamically to candidates.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <span style={{ color: 'var(--success-color)', fontSize: '1.1rem', fontWeight: 'bold' }}>✓</span>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Manage candidate application pipelines seamlessly.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <span style={{ color: 'var(--success-color)', fontSize: '1.1rem', fontWeight: 'bold' }}>✓</span>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Filter candidates using high-speed query selectors.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Split Form panel */}
            <div className="auth-split-content">
                <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
                    <ThemeToggle />
                </div>

                <div style={{ width: '100%', maxWidth: '360px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Recruiter Portal</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Sign in to manage listings and candidates</p>
                    </div>

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
                            <label className="form-label" htmlFor="email">Work Email</label>
                            <input
                                type="email"
                                id="email"
                                className="form-control"
                                placeholder="recruiter@company.com"
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
                            style={{ backgroundColor: 'var(--success-color)', color: '#fff' }}
                            disabled={loading}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>New recruiter? </span>
                        <Link to="/recruiter/register" style={{ color: 'var(--success-color)', fontWeight: 600 }}>Register company account</Link>
                    </div>
                    
                    <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>
                        <Link to="/" style={{ color: 'var(--text-muted)' }}>← Back to portal selection</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
