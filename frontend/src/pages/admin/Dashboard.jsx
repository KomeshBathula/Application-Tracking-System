import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import AppLayout from '../../components/AppLayout';
import api from '../../services/api';

const Dashboard = ({ section = 'dashboard' }) => {
    const { user, checkUsername } = useContext(AuthContext);
    const activeTab = section;

    // Paginated Users State (Super Admin User Management)
    const [usersData, setUsersData] = useState({ content: [], totalPages: 0, totalElements: 0, number: 0, size: 10 });
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [usersError, setUsersError] = useState('');

    // Create Company Admin Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [modalError, setModalError] = useState('');
    const [modalSuccess, setModalSuccess] = useState('');
    const [modalLoading, setModalLoading] = useState(false);

    // Username check state for modal
    const [usernameStatus, setUsernameStatus] = useState('idle');
    const [usernameMessage, setUsernameMessage] = useState('');

    useEffect(() => {
        document.title = "Admin Control Center - ATS";
    }, []);

    // Fetch Paginated Users
    const fetchUsers = async () => {
        setLoadingUsers(true);
        setUsersError('');
        try {
            const params = {
                page,
                size: pageSize,
                search: search.trim() || undefined,
                role: roleFilter !== 'ALL' ? roleFilter : undefined
            };
            const response = await api.get('/admin/users', { params });
            if (response.data && response.data.success && response.data.data) {
                setUsersData(response.data.data);
            }
        } catch (err) {
            setUsersError(err.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        }
    }, [activeTab, page, pageSize, roleFilter]);

    // Debounced search for users
    useEffect(() => {
        if (activeTab !== 'users') return;
        const timer = setTimeout(() => {
            setPage((prevPage) => {
                if (prevPage === 0) {
                    fetchUsers();
                    return 0;
                }
                return 0; // Trigger page-change effect which calls fetchUsers automatically
            });
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    // Live Username Verification for Modal
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

    const handleCreateCompanyAdmin = async (e) => {
        e.preventDefault();
        setModalError('');
        setModalSuccess('');

        if (!fullName.trim() || !email.trim() || !password || !companyName.trim()) {
            setModalError('All fields are required.');
            return;
        }

        const pwd = password;
        if (pwd.length < 8 || !/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd) || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
            setModalError('Initial password must be at least 8 characters long and contain at least one capital letter, one number, and one special character.');
            return;
        }

        if (usernameStatus !== 'available') {
            setModalError('Please enter a valid and available username.');
            return;
        }

        setModalLoading(true);
        try {
            const response = await api.post('/admin/company-admins', {
                fullName: fullName.trim(),
                username: username.trim().toLowerCase(),
                email: email.trim(),
                password,
                companyName: companyName.trim()
            });

            if (response.data && response.data.success) {
                setModalSuccess('Company Admin created successfully! First-time password update set.');
                setFullName('');
                setUsername('');
                setEmail('');
                setPassword('');
                setCompanyName('');
                setUsernameStatus('idle');
                fetchUsers();
                setTimeout(() => {
                    setShowCreateModal(false);
                    setModalSuccess('');
                }, 1500);
            }
        } catch (err) {
            setModalError(err.response?.data?.message || 'Failed to create Company Admin.');
        } finally {
            setModalLoading(false);
        }
    };

    const handleToggleStatus = async (userId, currentEnabled) => {
        try {
            await api.patch(`/admin/users/${userId}/status?enabled=${!currentEnabled}`);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update user status.');
        }
    };

    const navigationItems = [
        { 
            id: 'dashboard', 
            label: 'Dashboard', 
            path: '/admin/dashboard',
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
            label: 'Users Management', 
            path: '/admin/users',
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
            path: '/admin/roles',
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
            path: '/admin/settings',
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
            navigationItems={navigationItems}
            roleTitle="Super Administrator"
            roleColor="var(--danger-color)"
        >
            {activeTab === 'dashboard' && (
                <div>
                    <div className="card" style={{ background: 'linear-gradient(135deg, var(--danger-light) 0%, rgba(0,0,0,0) 100%)', border: '1px solid var(--border-color)' }}>
                        <div className="card-body" style={{ padding: '2.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h1 style={{ marginBottom: '0.5rem', fontWeight: 800 }}>Welcome, {user?.fullName}</h1>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '640px' }}>Super Admin Control Panel: Provision Company Admins, inspect scalable user directories, and manage access.</p>
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowCreateModal(true)}
                                style={{ fontWeight: 700, padding: '0.75rem 1.25rem' }}
                            >
                                + Create Company Admin
                            </button>
                        </div>
                    </div>

                    <div className="dashboard-grid dashboard-grid-2-1" style={{ marginTop: '1.5rem' }}>
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">System Infrastructure Status</h3>
                            </div>
                            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Server Engine Status</span>
                                    <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>Online</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Database Engine</span>
                                    <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>MySQL (Connected)</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Scalable User Query Mode</span>
                                    <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>Paginated JPA Queries</span>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Role Privileges Summary</h3>
                            </div>
                            <div className="card-body" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                <p><strong>Super Admin:</strong> Creates Company Admins & manages global user directory with scalable pagination.</p>
                                <p style={{ marginTop: '0.5rem' }}><strong>Company Admin:</strong> Provisions recruiters for their company & manages internal recruiters.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 className="card-title">Scalable User Directory</h3>
                            <p className="card-subtitle">Server-side paginated list of all system users ({usersData.totalElements || 0} total)</p>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowCreateModal(true)}
                            style={{ fontWeight: 600, fontSize: '0.9rem' }}
                        >
                            + Create Company Admin
                        </button>
                    </div>

                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Filters Bar */}
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <div style={{ flex: 1, minWidth: '220px' }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by name, email, or @username..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div style={{ width: '180px' }}>
                                <select
                                    className="form-control"
                                    value={roleFilter}
                                    onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
                                >
                                    <option value="ALL">All Roles</option>
                                    <option value="ADMIN">Super Admin</option>
                                    <option value="COMPANY_ADMIN">Company Admin</option>
                                    <option value="RECRUITER">Recruiter</option>
                                    <option value="CANDIDATE">Candidate</option>
                                </select>
                            </div>

                            <div style={{ width: '120px' }}>
                                <select
                                    className="form-control"
                                    value={pageSize}
                                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                                >
                                    <option value={10}>10 / page</option>
                                    <option value={25}>25 / page</option>
                                    <option value={50}>50 / page</option>
                                </select>
                            </div>
                        </div>

                        {usersError && (
                            <div className="alert alert-danger">{usersError}</div>
                        )}

                        {/* Paginated User Table */}
                        {loadingUsers ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                Loading user directory...
                            </div>
                        ) : usersData.content.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                No users found matching current filters.
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                                            <th style={{ padding: '0.75rem 1rem' }}>User</th>
                                            <th style={{ padding: '0.75rem 1rem' }}>Handle</th>
                                            <th style={{ padding: '0.75rem 1rem' }}>Email</th>
                                            <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                                            <th style={{ padding: '0.75rem 1rem' }}>Company</th>
                                            <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                                            <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usersData.content.map(u => (
                                            <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{u.fullName}</td>
                                                <td style={{ padding: '0.85rem 1rem', color: 'var(--primary-color)', fontWeight: 500 }}>@{u.username}</td>
                                                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                                                <td style={{ padding: '0.85rem 1rem' }}>
                                                    <span className={`badge ${
                                                        u.role === 'ADMIN' ? 'badge-danger' :
                                                        u.role === 'COMPANY_ADMIN' ? 'badge-warning' :
                                                        u.role === 'RECRUITER' ? 'badge-success' : 'badge-info'
                                                    }`} style={{ fontSize: '0.75rem' }}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                                                    {u.companyName || '-'}
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem' }}>
                                                    <span className={`badge ${u.enabled ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.75rem' }}>
                                                        {u.enabled ? 'Active' : 'Disabled'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                                                    {Boolean((user?.id && u.id === user.id) || (user?.email && u.email && u.email.toLowerCase() === user.email.toLowerCase())) ? (
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>-</span>
                                                    ) : (
                                                        <button
                                                            className={`btn btn-sm ${u.enabled ? 'btn-ghost' : 'btn-primary'}`}
                                                            onClick={() => handleToggleStatus(u.id, u.enabled)}
                                                            style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem' }}
                                                        >
                                                            {u.enabled ? 'Disable' : 'Enable'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination Bar */}
                        {usersData.totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    Page {usersData.number + 1} of {usersData.totalPages}
                                </span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        disabled={usersData.number === 0}
                                        onClick={() => setPage(p => Math.max(0, p - 1))}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        disabled={usersData.number >= usersData.totalPages - 1}
                                        onClick={() => setPage(p => p + 1)}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'roles' && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">ATS System Access Control Matrix</h3>
                        <p className="card-subtitle">Granular role permissions and security scope boundaries across the platform</p>
                    </div>
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                                        <th style={{ padding: '0.75rem 1rem' }}>Capability Scope</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>Super Admin</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>Company Admin</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>Recruiter</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>Candidate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Create Company Admins</td>
                                        <td style={{ padding: '0.85rem 1rem', color: 'var(--success-color)', fontWeight: 600 }}>Allowed</td>
                                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>Denied</td>
                                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>Denied</td>
                                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>Denied</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Create Company Recruiters</td>
                                        <td style={{ padding: '0.85rem 1rem', color: 'var(--success-color)', fontWeight: 600 }}>Allowed</td>
                                        <td style={{ padding: '0.85rem 1rem', color: 'var(--success-color)', fontWeight: 600 }}>Allowed (Own Co.)</td>
                                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>Denied</td>
                                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>Denied</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Scalable Paginated User Management</td>
                                        <td style={{ padding: '0.85rem 1rem', color: 'var(--success-color)', fontWeight: 600 }}>Global Directory</td>
                                        <td style={{ padding: '0.85rem 1rem', color: 'var(--success-color)', fontWeight: 600 }}>Company Scope</td>
                                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>Denied</td>
                                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>Denied</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Configure AI Screening Models</td>
                                        <td style={{ padding: '0.85rem 1rem', color: 'var(--success-color)', fontWeight: 600 }}>Full Control</td>
                                        <td style={{ padding: '0.85rem 1rem', color: 'var(--success-color)', fontWeight: 600 }}>Enterprise Scope</td>
                                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>Denied</td>
                                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>Denied</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Manage Job Postings</td>
                                        <td style={{ padding: '0.85rem 1rem', color: 'var(--success-color)', fontWeight: 600 }}>Global Oversight</td>
                                        <td style={{ padding: '0.85rem 1rem', color: 'var(--success-color)', fontWeight: 600 }}>Company Jobs</td>
                                        <td style={{ padding: '0.85rem 1rem', color: 'var(--success-color)', fontWeight: 600 }}>Assigned Jobs</td>
                                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>Denied</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Submit Job Applications</td>
                                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>Denied</td>
                                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>Denied</td>
                                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>Denied</td>
                                        <td style={{ padding: '0.85rem 1rem', color: 'var(--success-color)', fontWeight: 600 }}>Allowed</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">System Governance & Control Center</h3>
                        <p className="card-subtitle">Global security policies, authentication rules, email gateways, and infrastructure parameters</p>
                    </div>
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Governance Category 1: Security & Auth */}
                        <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>
                                    Authentication & Password Security Governance
                                </h4>
                                <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>Enforced</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)' }}>Min Password Length:</span>
                                    <strong style={{ display: 'block', color: 'var(--text-primary)', marginTop: '0.2rem' }}>8 Characters</strong>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)' }}>Required Complexity:</span>
                                    <strong style={{ display: 'block', color: 'var(--text-primary)', marginTop: '0.2rem' }}>1 Uppercase, 1 Number, 1 Special Char</strong>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)' }}>First-Time Password Reset:</span>
                                    <strong style={{ display: 'block', color: 'var(--success-color)', marginTop: '0.2rem' }}>Mandatory On 1st Login</strong>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)' }}>Session Authentication:</span>
                                    <strong style={{ display: 'block', color: 'var(--text-primary)', marginTop: '0.2rem' }}>Stateless JWT (24h Expiry)</strong>
                                </div>
                            </div>
                        </div>

                        {/* Governance Category 2: Email & Gateway */}
                        <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>
                                    System Mail & SMTP Notification Gateway
                                </h4>
                                <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>SMTP Ready</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)' }}>SMTP Mail Host:</span>
                                    <strong style={{ display: 'block', color: 'var(--text-primary)', marginTop: '0.2rem' }}>smtp.gmail.com:587</strong>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)' }}>Sender Address:</span>
                                    <strong style={{ display: 'block', color: 'var(--text-primary)', marginTop: '0.2rem' }}>noreply@ats-system.com</strong>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)' }}>Automated Password Reset Emails:</span>
                                    <strong style={{ display: 'block', color: 'var(--success-color)', marginTop: '0.2rem' }}>Enabled</strong>
                                </div>
                            </div>
                        </div>

                        {/* Governance Category 3: Resume Storage & Files */}
                        <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>
                                    Candidate Resume Storage & File Policy
                                </h4>
                                <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>Local Storage</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)' }}>Max Resume Upload Limit:</span>
                                    <strong style={{ display: 'block', color: 'var(--text-primary)', marginTop: '0.2rem' }}>10 MB per File</strong>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)' }}>Allowed Extensions:</span>
                                    <strong style={{ display: 'block', color: 'var(--text-primary)', marginTop: '0.2rem' }}>.PDF, .DOCX, .DOC, .TXT</strong>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)' }}>Parsing & Text Extraction:</span>
                                    <strong style={{ display: 'block', color: 'var(--success-color)', marginTop: '0.2rem' }}>Apache Tika Engine Active</strong>
                                </div>
                            </div>
                        </div>

                        {/* Governance Category 4: AI & Database Infrastructure */}
                        <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>
                                    AI Multi-Provider & Scalable Database Infrastructure
                                </h4>
                                <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>Multi-LLM Active</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)' }}>Supported AI Providers:</span>
                                    <strong style={{ display: 'block', color: 'var(--primary-color)', marginTop: '0.2rem' }}>OpenAI, Groq, Claude, Gemini, DeepSeek</strong>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)' }}>Scalable Query Pagination:</span>
                                    <strong style={{ display: 'block', color: 'var(--text-primary)', marginTop: '0.2rem' }}>JPA Pageable (Max 100 records/page)</strong>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)' }}>Database Engine:</span>
                                    <strong style={{ display: 'block', color: 'var(--text-primary)', marginTop: '0.2rem' }}>MySQL (Indexed Filters)</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Create Company Admin */}
            {showCreateModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div className="card" style={{ maxWidth: '460px', width: '100%', borderRadius: '14px', backgroundColor: 'var(--bg-primary)' }}>
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 className="card-title" style={{ fontSize: '1.2rem', fontWeight: 700 }}>Create Company Admin</h3>
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setShowCreateModal(false)}
                                style={{ fontSize: '1.1rem', lineHeight: 1 }}
                            >
                                ×
                            </button>
                        </div>

                        <div className="card-body">
                            {modalError && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{modalError}</div>}
                            {modalSuccess && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{modalSuccess}</div>}

                            <form onSubmit={handleCreateCompanyAdmin} noValidate>
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label className="form-label" htmlFor="caFullName">Full Name</label>
                                    <input
                                        type="text"
                                        id="caFullName"
                                        className="form-control"
                                        placeholder="e.g. Sarah Jenkins"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label className="form-label" htmlFor="caCompanyName">Company Name</label>
                                    <input
                                        type="text"
                                        id="caCompanyName"
                                        className="form-control"
                                        placeholder="e.g. Acme Corp"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <label className="form-label" htmlFor="caUsername">Username Handle</label>
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
                                    <input
                                        type="text"
                                        id="caUsername"
                                        className="form-control"
                                        placeholder="sarah_admin"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                                        required
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label className="form-label" htmlFor="caEmail">Work Email</label>
                                    <input
                                        type="email"
                                        id="caEmail"
                                        className="form-control"
                                        placeholder="sarah@acme.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                    <label className="form-label" htmlFor="caPassword">Initial Default Password</label>
                                    <input
                                        type="password"
                                        id="caPassword"
                                        className="form-control"
                                        placeholder="Default password (User must update on 1st login)"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowCreateModal(false)}
                                        style={{ flex: 1 }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={modalLoading || usernameStatus !== 'available'}
                                        style={{ flex: 2, fontWeight: 700 }}
                                    >
                                        {modalLoading ? 'Creating...' : 'Create Company Admin'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
};

export default Dashboard;
