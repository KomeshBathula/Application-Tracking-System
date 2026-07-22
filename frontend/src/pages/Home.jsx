import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const Home = () => {
    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Login Form State
    const [loginIdentifier, setLoginIdentifier] = useState(''); // email or username
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    useEffect(() => {
        document.title = "ATS Portal - Career & Applicant Platform";
        if (user) {
            const roleClean = user.role.replace('ROLE_', '');
            if (roleClean === 'ADMIN') navigate('/admin/dashboard');
            else if (roleClean === 'COMPANY_ADMIN' || roleClean === 'RECRUITER') navigate('/recruiter/dashboard');
            else if (roleClean === 'CANDIDATE') navigate('/candidate/dashboard');
        }
    }, [user, navigate]);

    // Handle Login Submit
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');
        if (!loginIdentifier.trim()) {
            setLoginError('Email or username is required.');
            return;
        }
        if (!loginPassword) {
            setLoginError('Password is required.');
            return;
        }

        setLoginLoading(true);
        const result = await login(loginIdentifier.trim(), loginPassword);
        setLoginLoading(false);

        if (!result.success) {
            setLoginError(result.message);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
            {/* Header */}
            <header className="topbar" style={{ padding: '0 2rem' }}>
                <div className="topbar-left">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '1.25rem' }}>
                        <span style={{ color: 'var(--text-primary)' }}>ATS Careers</span>
                    </div>
                </div>
                <div className="topbar-right">
                    <ThemeToggle />
                </div>
            </header>

            {/* Main Application Container */}
            <div className="auth-split-container" style={{ flex: 1 }}>
                {/* Left Panel: Application Overview & Branding */}
                <div className="auth-split-sidebar">
                    <div style={{ maxWidth: '420px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 1rem', borderRadius: '9999px', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                            <span>Next-Gen Talent Acquisition</span>
                        </div>

                        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                            Discover Your Next Career Breakthrough.
                        </h1>

                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                            Our intelligent Applicant Tracking System connects top candidates with world-class opportunities. Manage applications, track interviews, and upload resumes seamlessly.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>Direct Application Tracking</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>Monitor real-time updates on your job applications and interview schedules.</p>
                            </div>

                            <div>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>AI-Powered Screening</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>Experience fast resume evaluations and automated match scoring.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Sign In Form */}
                <div className="auth-split-content">
                    <div style={{ width: '100%', maxWidth: '380px', margin: '0 auto' }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Sign In</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Welcome back! Enter your credentials to access your account</p>
                        </div>

                        {loginError && (
                            <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
                                {loginError}
                            </div>
                        )}

                        <form onSubmit={handleLoginSubmit} noValidate>
                            <div className="form-group">
                                <label className="form-label" htmlFor="loginIdentifier">Email Address or Username</label>
                                <input
                                    type="text"
                                    id="loginIdentifier"
                                    className="form-control"
                                    placeholder="Enter email or username"
                                    value={loginIdentifier}
                                    onChange={(e) => setLoginIdentifier(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                                <label className="form-label" htmlFor="loginPassword">Password</label>
                                <input
                                    type="password"
                                    id="loginPassword"
                                    className="form-control"
                                    placeholder="Enter your password"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                disabled={loginLoading}
                                style={{ padding: '0.8rem', fontSize: '1rem', fontWeight: 600 }}
                            >
                                {loginLoading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </form>

                        {/* Sign Up Redirect Content below Sign In button */}
                        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
                            <Link to="/register" style={{ fontWeight: 700, color: 'var(--primary-color)', textDecoration: 'none' }}>
                                Sign up
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
