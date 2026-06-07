import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="home-container">
            <header className="navbar" style={{ borderBottomColor: 'rgba(239, 68, 68, 0.2)' }}>
                <div className="navbar-brand">
                    <span className="logo-icon" style={{ color: '#ef4444' }}>▲</span>
                    <span>Admin Control Center</span>
                </div>
                <div className="user-profile-menu">
                    <ThemeToggle />
                    <span className="user-name">{user.fullName}</span>
                    <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger-color)' }}>Administrator</span>
                    <button className="btn btn-secondary btn-sm" onClick={logout}>Sign Out</button>
                </div>
            </header>

            <main className="main-content">
                <div className="welcome-banner" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(11, 15, 25, 0.5) 100%)' }}>
                    <h1>Welcome, {user.fullName}</h1>
                    <p>Manage system users, adjust authorizations, and review portal operations.</p>
                </div>

                <div className="dashboard-grid">
                    {/* Left Column: User Management */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="dashboard-card">
                            <h3>System Users</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
                                    <div>
                                        <h4 style={{ color: 'var(--text-primary)' }}>admin@ats.com</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Admin account</p>
                                    </div>
                                    <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger-color)' }}>Active</span>
                                </div>

                                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
                                    <div>
                                        <h4 style={{ color: 'var(--text-primary)' }}>recruiter@ats.com</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Recruiter account</p>
                                    </div>
                                    <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--success-color)' }}>Active</span>
                                </div>

                                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
                                    <div>
                                        <h4 style={{ color: 'var(--text-primary)' }}>candidate@ats.com</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Candidate account</p>
                                    </div>
                                    <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary-color)' }}>Active</span>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-card">
                            <h3>Portal Status</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem', fontSize: '0.9rem' }}>
                                <p style={{ color: 'var(--text-secondary)' }}>Server Status: <strong style={{ color: 'var(--success-color)' }}>Online</strong></p>
                                <p style={{ color: 'var(--text-secondary)' }}>Database Connection: <strong style={{ color: 'var(--success-color)' }}>Connected</strong></p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: User details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="dashboard-card">
                            <h3>Console Details</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', marginTop: '1rem' }}>
                                <p style={{ color: 'var(--text-secondary)' }}>Console ID: <strong style={{ color: 'var(--text-primary)' }}>#9981</strong></p>
                                <p style={{ color: 'var(--text-secondary)' }}>Security Level: <strong style={{ color: 'var(--text-primary)' }}>Level 1 (Full Access)</strong></p>
                            </div>
                        </div>

                        <div className="dashboard-card">
                            <h3>Administrator Notice</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                                All actions performed within this console are tracked for audit purposes. Ensure security keys are kept safe.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
