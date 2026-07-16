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
        document.title = "Candidate Sign In - ATS";
        if (user) {
            const roleClean = user.role.replace('ROLE_', '');
            if (roleClean === 'CANDIDATE') {
                navigate('/candidate/dashboard');
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
            navigate('/candidate/dashboard');
        } else {
            setApiError(result.message);
        }
    };

    return (
        <div className="auth-split-container">
            {/* Split Sidebar panel */}
            <div className="auth-split-sidebar">
                <div style={{ maxWidth: '400px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '1.25rem', marginBottom: '4rem' }}>
                        <div className="sidebar-brand-icon" style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}>▲</div>
                        <span style={{ color: 'var(--text-primary)' }}>ATS Portal</span>
                    </div>
                    
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                        Accelerate your next career step.
                    </h2>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <span style={{ color: 'var(--primary-color)', fontSize: '1.1rem', fontWeight: 'bold' }}>✓</span>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Apply directly to active job openings at top companies.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <span style={{ color: 'var(--primary-color)', fontSize: '1.1rem', fontWeight: 'bold' }}>✓</span>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Securely upload and parse your resume documents.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <span style={{ color: 'var(--primary-color)', fontSize: '1.1rem', fontWeight: 'bold' }}>✓</span>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Keep tabs on application reviews and status updates.</p>
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
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Candidate Portal</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Sign in to apply and track your job applications</p>
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
                            <label className="form-label" htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                className="form-control"
                                placeholder="e.g. candidate@ats.com"
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
                            className="btn btn-primary btn-block"
                            disabled={loading}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>New candidate? </span>
                        <Link to="/candidate/register" style={{ fontWeight: 600 }}>Create an account</Link>
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
