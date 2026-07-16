import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import AppLayout from '../../components/AppLayout';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        document.title = "Admin Control Center - ATS";
    }, []);

    const navigationItems = [
        { 
            id: 'dashboard', 
            label: 'Dashboard', 
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="9"></rect>
                    <rect x="14" y="3" width="7" height="5"></rect>
                    <rect x="14" y="12" width="7" height="9"></rect>
                    <rect x="3" y="16" width="7" height="5"></rect>
                </svg>
            )
        },
        { 
            id: 'users', 
            label: 'Users', 
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            )
        },
        { 
            id: 'roles', 
            label: 'Roles', 
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
            )
        },
        { 
            id: 'settings', 
            label: 'System Settings', 
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
            )
        }
    ];

    return (
        <AppLayout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            navigationItems={navigationItems}
            roleTitle="Administrator"
            roleColor="var(--danger-color)"
        >
            {activeTab === 'dashboard' && (
                <div>
                    <div className="card" style={{ background: 'linear-gradient(135deg, var(--danger-light) 0%, rgba(0,0,0,0) 100%)', border: '1px solid var(--border-color)' }}>
                        <div className="card-body" style={{ padding: '2.5rem 2rem' }}>
                            <h1 style={{ marginBottom: '0.5rem', fontWeight: 800 }}>Welcome, {user?.fullName}</h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '640px' }}>Manage user directories, configure authorizations, and audit general portal diagnostics.</p>
                        </div>
                    </div>

                    <div className="dashboard-grid dashboard-grid-2-1" style={{ marginTop: '1.5rem' }}>
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">System Diagnostics</h3>
                            </div>
                            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Server Engine Status</span>
                                    <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>Online</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Database Status</span>
                                    <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>MySQL (Connected)</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Hiring Postings Registered</span>
                                    <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>Managed by Recruiter</span>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Administrator Notice</h3>
                            </div>
                            <div className="card-body">
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6' }}>
                                    All administrative actions executed in this control center are securely logged for compliance audits. Please keep database configurations unchanged.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">User Management</h3>
                        <p className="card-subtitle">Registered security credentials and roles</p>
                    </div>
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
                            <div>
                                <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.925rem' }}>admin@ats.com</h4>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>System Administrator</p>
                            </div>
                            <span className="badge badge-danger" style={{ fontSize: '0.75rem' }}>Active</span>
                        </div>
                        <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
                            <div>
                                <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.925rem' }}>recruiter@ats.com</h4>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>Recruiter Workspace Moderator</p>
                            </div>
                            <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>Active</span>
                        </div>
                        <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
                            <div>
                                <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.925rem' }}>candidate@ats.com</h4>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>Job Candidate</p>
                            </div>
                            <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>Active</span>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'roles' && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">System Role Permissions</h3>
                        <p className="card-subtitle">Scope definitions matching backend database values</p>
                    </div>
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.25rem', backgroundColor: 'var(--bg-secondary)' }}>
                            <h4 style={{ color: 'var(--text-primary)', fontWeight: 600 }}>ROLE_ADMIN</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: '1.5' }}>Full authorization to configure system properties, modify user access tokens, and monitor operations.</p>
                        </div>
                        <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.25rem', backgroundColor: 'var(--bg-secondary)' }}>
                            <h4 style={{ color: 'var(--text-primary)', fontWeight: 600 }}>ROLE_RECRUITER</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: '1.5' }}>Authorization to manage hiring listings, edit/publish job parameters, and review candidate directories.</p>
                        </div>
                        <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.25rem', backgroundColor: 'var(--bg-secondary)' }}>
                            <h4 style={{ color: 'var(--text-primary)', fontWeight: 600 }}>ROLE_CANDIDATE</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: '1.5' }}>Authorization to search active job opportunities, submit personal resume attachments, and track submissions.</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">System Settings</h3>
                    </div>
                    <div className="card-body">
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Configure session properties and workspace parameters.</p>
                        <div style={{ border: '1px dashed var(--border-color)', borderRadius: '8px', padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                            <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>Standard Configurations Active</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Global credentials and security filter rules are managed dynamically via Spring Security Context.</p>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
};

export default Dashboard;
