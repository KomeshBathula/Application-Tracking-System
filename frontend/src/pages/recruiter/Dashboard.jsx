import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="home-container">
            <header className="navbar">
                <div className="navbar-brand">
                    <span className="logo-icon" style={{ color: '#10b981' }}>▲</span>
                    <span>Recruiter Portal</span>
                </div>
                <div className="user-profile-menu">
                    <ThemeToggle />
                    <span className="user-name">{user.fullName}</span>
                    <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--success-color)' }}>Recruiter</span>
                    <button className="btn btn-secondary btn-sm" onClick={logout}>Sign Out</button>
                </div>
            </header>

            <main className="main-content">
                <div className="welcome-banner" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(11, 15, 25, 0.5) 100%)' }}>
                    <h1>Welcome, {user.fullName}!</h1>
                    <p>Manage your postings, track candidate status updates, and review applicant applications.</p>
                </div>

                <div className="dashboard-grid">
                    {/* Left Column: Job Postings & Candidates */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="dashboard-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3>Active Job Postings</h3>
                                <button className="btn btn-sm" style={{ backgroundColor: '#10b981', color: '#fff' }}>Post New Job</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
                                    <div>
                                        <h4 style={{ color: 'var(--text-primary)' }}>Senior Java Engineer</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Engineering | Full-time</p>
                                    </div>
                                    <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--success-color)' }}>12 Applicants</span>
                                </div>

                                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
                                    <div>
                                        <h4 style={{ color: 'var(--text-primary)' }}>Frontend React Developer</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Design Team | Full-time</p>
                                    </div>
                                    <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--success-color)' }}>5 Applicants</span>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-card">
                            <h3>Applicants Review</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
                                    <div>
                                        <h4 style={{ color: 'var(--text-primary)' }}>John Doe</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Applied for Senior Java Engineer</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn btn-secondary btn-sm" style={{ borderColor: 'var(--success-color)', color: 'var(--success-color)' }}>Schedule Interview</button>
                                        <button className="btn btn-secondary btn-sm">Review Profile</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: User details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="dashboard-card">
                            <h3>Workspace details</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', marginTop: '1rem' }}>
                                <p style={{ color: 'var(--text-secondary)' }}>Account Name: <strong style={{ color: 'var(--text-primary)' }}>{user.fullName}</strong></p>
                                <p style={{ color: 'var(--text-secondary)' }}>Registered Email: <strong style={{ color: 'var(--text-primary)' }}>{user.email}</strong></p>
                                <p style={{ color: 'var(--text-secondary)' }}>Workspace Status: <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--success-color)' }}>Online</span></p>
                            </div>
                        </div>

                        <div className="dashboard-card">
                            <h3>Recruiting Pipeline Tip</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                                Keep candidate profiles updated inside the panel. Scheduling interviews promptly increases candidate conversion and onboarding.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
