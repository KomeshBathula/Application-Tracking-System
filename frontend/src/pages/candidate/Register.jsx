import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';

const Register = () => {
    const { register, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [validationError, setValidationError] = useState('');
    const [apiError, setApiError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            navigate('/candidate/dashboard');
        }
    }, [user, navigate]);

    const validateForm = () => {
        if (!fullName.trim()) {
            setValidationError('Full Name is required.');
            return false;
        }
        if (fullName.trim().length < 2) {
            setValidationError('Full Name must be at least 2 characters.');
            return false;
        }
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
        if (password.length < 6) {
            setValidationError('Password must be at least 6 characters.');
            return false;
        }
        setValidationError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        setSuccessMessage('');

        if (!validateForm()) return;

        setLoading(true);
        const result = await register(fullName, email, password, 'CANDIDATE');
        setLoading(false);

        if (result.success) {
            setSuccessMessage('Registration successful! You can now log in.');
            setFullName('');
            setEmail('');
            setPassword('');
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

            <div className="auth-card">
                <h2>Candidate Sign Up</h2>
                <p className="subtitle">Create an account to start applying for jobs</p>

                {successMessage && (
                    <div className="alert alert-success" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <span>{successMessage}</span>
                        <Link to="/login" className="btn btn-primary" style={{ textAlign: 'center', textDecoration: 'none' }}>
                            Go to Sign In
                        </Link>
                    </div>
                )}

                {!successMessage && (
                    <>
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
                                <label htmlFor="fullName">Full Name</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    className="form-control"
                                    placeholder="Enter your name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="form-control"
                                    placeholder="e.g. name@domain.com"
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
                                    placeholder="Minimum 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                disabled={loading}
                            >
                                {loading ? 'Registering...' : 'Register'}
                            </button>
                        </form>
                    </>
                )}

                <p className="auth-footer" style={{ marginTop: successMessage ? '1rem' : '1.5rem' }}>
                    Already have an account? <Link to="/login">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
