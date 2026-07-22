import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';

const CompanyAdminLogin = () => {
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
        document.title = "Company Admin & Recruiter Console";
        if (user) {
            const roleClean = user.role.replace('ROLE_', '');
            if (roleClean === 'COMPANY_ADMIN' || roleClean === 'RECRUITER') {
                navigate('/recruiter/dashboard', { replace: true });
            } else if (roleClean === 'ADMIN') {
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
            setValidationError('Email or username is required.');
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
            if (roleClean === 'CANDIDATE') {
                logout();
                setApiError('Access Denied: This portal is reserved for Company Admins and Recruiters.');
            } else if (roleClean === 'COMPANY_ADMIN' || roleClean === 'RECRUITER') {
                navigate('/recruiter/dashboard', { replace: true });
            } else if (roleClean === 'ADMIN') {
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
            backgroundColor: 'var(--bg-primary)',
            padding: '2rem',
            position: 'relative'
        }}>
            <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
                <ThemeToggle />
            </div>

            <div className="card" style={{
                maxWidth: '400px',
                width: '100%',
                borderRadius: '16px',
                boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
                borderTop: '4px solid var(--primary-color)'
            }}>
                <div className="card-body" style={{ padding: '2.5rem 2rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
                            Enterprise Management Console
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            Dedicated access for Company Admins and Hiring Managers
                        </p>
                    </div>

                    {sessionExpired && (
                        <div className="alert alert-warning" style={{ marginBottom: '1.25rem' }}>
                            Session expired. Please re-authenticate.
                        </div>
                    )}

                    {apiError && (
                        <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
                            {apiError}
                        </div>
                    )}

                    {validationError && (
                        <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
                            {validationError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                            <label className="form-label" htmlFor="email">
                                Company Email or Username
                            </label>
                            <input
                                type="text"
                                id="email"
                                className="form-control"
                                placeholder="Enter corporate credentials"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                            <label className="form-label" htmlFor="password">
                                Password
                            </label>
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
                            style={{
                                fontWeight: 700,
                                padding: '0.8rem',
                                borderRadius: '8px',
                                fontSize: '0.95rem'
                            }}
                            disabled={loading}
                        >
                            {loading ? 'Authenticating...' : 'Sign In as Company Admin'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CompanyAdminLogin;
