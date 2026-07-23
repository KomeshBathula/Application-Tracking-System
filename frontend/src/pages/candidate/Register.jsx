import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';

const Register = () => {
    const { register, checkUsername, user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Form State
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [signUpError, setSignUpError] = useState('');
    const [signUpSuccess, setSignUpSuccess] = useState('');
    const [signUpLoading, setSignUpLoading] = useState(false);

    // Username Status: 'idle' | 'checking' | 'available' | 'unavailable' | 'invalid'
    const [usernameStatus, setUsernameStatus] = useState('idle');
    const [usernameMessage, setUsernameMessage] = useState('');

    // Password requirement state
    const [pwdChecks, setPwdChecks] = useState({
        length: false,
        capital: false,
        number: false,
        special: false,
    });

    useEffect(() => {
        document.title = "Candidate Registration - ATS Careers";
        if (user) {
            navigate('/candidate/dashboard');
        }
    }, [user, navigate]);

    // Live Username Verification
    useEffect(() => {
        let isCurrent = true;
        if (!username || username.trim().length === 0) {
            setUsernameStatus('idle');
            setUsernameMessage('');
            return;
        }

        const clean = username.trim().toLowerCase();
        const validFormat = /^[a-zA-Z0-9._]{3,30}$/.test(clean);
        if (!validFormat) {
            setUsernameStatus('invalid');
            setUsernameMessage('3-30 characters (letters, numbers, underscores, or dots)');
            return;
        }

        setUsernameStatus('checking');
        setUsernameMessage('Checking availability...');

        const timer = setTimeout(async () => {
            const result = await checkUsername(clean);
            if (isCurrent) {
                if (result.available) {
                    setUsernameStatus('available');
                    setUsernameMessage('Username is available');
                } else {
                    setUsernameStatus('unavailable');
                    setUsernameMessage(result.message || 'Username is not available');
                }
            }
        }, 350);

        return () => {
            isCurrent = false;
            clearTimeout(timer);
        };
    }, [username, checkUsername]);

    // Live Password Validation
    useEffect(() => {
        setPwdChecks({
            length: password.length >= 8,
            capital: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        });
    }, [password]);

    const isPasswordValid = pwdChecks.length && pwdChecks.capital && pwdChecks.number && pwdChecks.special;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSignUpError('');
        setSignUpSuccess('');

        if (!fullName.trim() || fullName.trim().length < 2) {
            setSignUpError('Full name must be at least 2 characters.');
            return;
        }

        if (usernameStatus !== 'available') {
            setSignUpError('Please enter an available username.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setSignUpError('Please enter a valid email address.');
            return;
        }

        if (!isPasswordValid) {
            setSignUpError('Password must meet all security requirements.');
            return;
        }

        setSignUpLoading(true);
        const result = await register(fullName.trim(), username.trim().toLowerCase(), email.trim(), password, 'CANDIDATE');
        setSignUpLoading(false);

        if (result.success) {
            setSignUpSuccess('Candidate account created successfully! Redirecting to sign in...');
            setTimeout(() => {
                navigate('/home');
            }, 1800);
        } else {
            setSignUpError(result.message);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
            {/* Topbar */}
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

            {/* Content Container */}
            <div className="auth-split-container" style={{ flex: 1 }}>
                {/* Left Panel: Application Info */}
                <div className="auth-split-sidebar">
                    <div style={{ maxWidth: '420px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 1rem', borderRadius: '9999px', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                            <span>Candidate Portal</span>
                        </div>

                        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                            Join Top Companies & Track Your Applications.
                        </h2>

                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                            Create your candidate profile to search active job listings, upload your resume, and communicate with hiring teams.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                Instant profile setup with unique username handle
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                Secure candidate data protection and resume storage
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                Real-time interview invitations and status tracking
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Sign Up Form */}
                <div className="auth-split-content">
                    <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Create Candidate Account</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Fill in your details below to register as a candidate</p>
                        </div>

                        {signUpSuccess && (
                            <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
                                {signUpSuccess}
                            </div>
                        )}

                        {signUpError && (
                            <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
                                {signUpError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate>
                            <div className="form-group">
                                <label className="form-label" htmlFor="fullName">Full Name</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    className="form-control"
                                    placeholder="Enter your full name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Username Field */}
                            <div className="form-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label className="form-label" htmlFor="username">Username</label>
                                    {usernameStatus !== 'idle' && (
                                        <span style={{
                                            fontSize: '0.78rem',
                                            fontWeight: 600,
                                            color: usernameStatus === 'available' ? 'var(--success-color)' :
                                                   usernameStatus === 'checking' ? 'var(--text-secondary)' : 'var(--danger-color)'
                                        }}>
                                            {usernameMessage}
                                        </span>
                                    )}
                                </div>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <span style={{
                                        position: 'absolute',
                                        left: '0.85rem',
                                        color: 'var(--text-secondary)',
                                        fontWeight: 600,
                                        fontSize: '0.95rem'
                                    }}>@</span>
                                    <input
                                        type="text"
                                        id="username"
                                        className="form-control"
                                        style={{
                                            paddingLeft: '2.2rem',
                                            borderColor: usernameStatus === 'available' ? 'var(--success-color)' :
                                                        (usernameStatus === 'unavailable' || usernameStatus === 'invalid') ? 'var(--danger-color)' : 'var(--border-color)'
                                        }}
                                        placeholder="janedoe"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="form-control"
                                    placeholder="e.g. candidate@domain.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Password Field with Requirements */}
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label className="form-label" htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    className="form-control"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />

                                {/* Password Criteria */}
                                <div style={{
                                    marginTop: '0.6rem',
                                    padding: '0.65rem 0.85rem',
                                    borderRadius: '8px',
                                    backgroundColor: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '0.4rem',
                                    fontSize: '0.78rem'
                                }}>
                                    <div style={{ color: pwdChecks.length ? 'var(--success-color)' : 'var(--text-secondary)', fontWeight: pwdChecks.length ? 600 : 400 }}>
                                        Min 8 characters
                                    </div>
                                    <div style={{ color: pwdChecks.capital ? 'var(--success-color)' : 'var(--text-secondary)', fontWeight: pwdChecks.capital ? 600 : 400 }}>
                                        1 Capital letter (A-Z)
                                    </div>
                                    <div style={{ color: pwdChecks.number ? 'var(--success-color)' : 'var(--text-secondary)', fontWeight: pwdChecks.number ? 600 : 400 }}>
                                        1 Number (0-9)
                                    </div>
                                    <div style={{ color: pwdChecks.special ? 'var(--success-color)' : 'var(--text-secondary)', fontWeight: pwdChecks.special ? 600 : 400 }}>
                                        1 Special character
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                disabled={signUpLoading || usernameStatus !== 'available' || !isPasswordValid}
                                style={{ padding: '0.8rem', fontSize: '1rem', fontWeight: 600 }}
                            >
                                {signUpLoading ? 'Creating Account...' : 'Sign Up'}
                            </button>
                        </form>

                        <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.9rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
                            <Link to="/home" style={{ fontWeight: 700, color: 'var(--primary-color)', textDecoration: 'none' }}>
                                Sign in
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
