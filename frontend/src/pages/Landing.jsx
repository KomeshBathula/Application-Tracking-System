import React, { useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const Landing = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "ATS Portal - Find & Apply to Jobs";
        if (user) {
            const roleClean = user.role.replace('ROLE_', '');
            if (roleClean === 'ADMIN') navigate('/admin/dashboard');
            else if (roleClean === 'RECRUITER') navigate('/recruiter/dashboard');
            else if (roleClean === 'CANDIDATE') navigate('/candidate/dashboard');
        }
    }, [user, navigate]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
            {/* Topbar */}
            <header className="topbar" style={{ padding: '0 2rem' }}>
                <div className="topbar-left">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '1.15rem' }}>
                        <div className="sidebar-brand-icon" style={{ width: '28px', height: '28px', fontSize: '0.85rem' }}>▲</div>
                        <span>ATS Portal</span>
                    </div>
                </div>
                <div className="topbar-right">
                    <ThemeToggle />
                </div>
            </header>

            {/* Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem 2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '3.5rem', maxWidth: '640px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 1rem', borderRadius: '9999px', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                        <span>Recruitment Portal</span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1.25, letterSpacing: '-0.03em' }}>
                        The Modern Hiring Infrastructure
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginTop: '1rem', lineHeight: '1.6' }}>
                        Streamline your recruitment processes, manage candidate profiles, and track jobs dynamically in one unified interface.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '800px', width: '100%' }}>
                    {/* Candidate Portal */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div className="card-body" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>Candidate Portal</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '2rem', flex: 1 }}>
                                Find open opportunities, submit detailed job applications, upload your resume, and monitor recruitment status in real time.
                            </p>
                            <Link to="/candidate/login" className="btn btn-primary btn-block">
                                Join as Candidate
                            </Link>
                        </div>
                    </div>

                    {/* Recruiter Portal */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div className="card-body" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'var(--success-light)', color: 'var(--success-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                </svg>
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>Recruiter Portal</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '2rem', flex: 1 }}>
                                Create and publish job openings, review candidate resumes, manage applications in the hiring pipeline, and track operations.
                            </p>
                            <Link to="/recruiter/login" className="btn btn-secondary btn-block">
                                Enter Recruiter Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing;
