import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="home-container">
            <header className="navbar">
                <div className="navbar-brand">
                    <span className="logo-icon">▲</span>
                    <span>Candidate Portal</span>
                </div>
                <div className="user-profile-menu">
                    <ThemeToggle />
                    <span className="user-name">{user.fullName}</span>
                    <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary-color)' }}>Candidate</span>
                    <button className="btn btn-secondary btn-sm" onClick={logout}>Sign Out</button>
                </div>
            </header>

            <main className="main-content">
                <div className="welcome-banner">
                    <h1>Welcome back, {user.fullName}!</h1>
                    <p>Track your applications, search job opportunities, and keep your resume up to date.</p>
                </div>

                <div className="dashboard-grid">
                    {/* Left Column: Job Postings & Applications */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="dashboard-card">
                            <h3>My Applications</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
                                    <div>
                                        <h4 style={{ color: 'var(--text-primary)' }}>Senior Java Engineer</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Software Services Corp</p>
                                    </div>
                                    <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning-color)' }}>Under Review</span>
                                </div>

                                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
                                    <div>
                                        <h4 style={{ color: 'var(--text-primary)' }}>React UI Developer</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Global Solutions Corp.</p>
                                    </div>
                                    <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary-color)' }}>Applied</span>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-card">
                            <h3>Recommended Positions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
                                    <div>
                                        <h4 style={{ color: 'var(--text-primary)' }}>Full Stack Java & React Engineer</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Austin, TX | Remote Available</p>
                                    </div>
                                    <button className="btn btn-primary btn-sm">Apply</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: User details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="dashboard-card">
                            <h3>Profile Summary</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', marginTop: '1rem' }}>
                                <p style={{ color: 'var(--text-secondary)' }}>Full Name: <strong style={{ color: 'var(--text-primary)' }}>{user.fullName}</strong></p>
                                <p style={{ color: 'var(--text-secondary)' }}>Email: <strong style={{ color: 'var(--text-primary)' }}>{user.email}</strong></p>
                                <p style={{ color: 'var(--text-secondary)' }}>Joined On: <strong style={{ color: 'var(--text-primary)' }}>{new Date(user.createdAt).toLocaleDateString()}</strong></p>
                                <p style={{ color: 'var(--text-secondary)' }}>Resume: <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>No resume uploaded</span></p>
                            </div>
                        </div>

                        <div className="dashboard-card">
                            <h3>Need Help?</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                                If you need assistance with your application or have questions regarding current openings, contact our support team.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
