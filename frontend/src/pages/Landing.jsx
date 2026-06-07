import React, { useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const Landing = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            const roleClean = user.role.replace('ROLE_', '');
            if (roleClean === 'ADMIN') navigate('/admin/dashboard');
            else if (roleClean === 'RECRUITER') navigate('/recruiter/dashboard');
            else if (roleClean === 'CANDIDATE') navigate('/candidate/dashboard');
        }
    }, [user, navigate]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Simple Top Navigation with Theme Switcher */}
            <header className="navbar">
                <div className="navbar-brand">
                    <span className="logo-icon">▲</span>
                    <span>Application Tracking System</span>
                </div>
                <div>
                    <ThemeToggle />
                </div>
            </header>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '1rem' }}>
                        Application Tracking System
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                        Welcome! Please select your portal to get started.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', maxWidth: '800px', width: '100%' }}>
                    {/* Candidate Portal Card */}
                    <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                        <div>
                            <h2 style={{ color: 'var(--primary-color)', marginBottom: '0.75rem', fontSize: '1.5rem' }}>Candidate Portal</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                                Find open jobs, submit your application, and keep track of your status.
                            </p>
                        </div>
                        <Link to="/login" className="btn btn-primary btn-block" style={{ textDecoration: 'none', textAlign: 'center' }}>
                            Join as Candidate
                        </Link>
                    </div>

                    {/* Recruiter Portal Card */}
                    <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                        <div>
                            <h2 style={{ color: 'var(--success-color)', marginBottom: '0.75rem', fontSize: '1.5rem' }}>Recruiter Portal</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                                Post jobs, search through profiles, and manage applicants in the funnel.
                            </p>
                        </div>
                        <Link to="/recruiter/login" className="btn btn-secondary btn-block" style={{ textDecoration: 'none', textAlign: 'center' }}>
                            Enter Recruiter Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing;
