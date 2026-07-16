import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import AppLayout from '../../components/AppLayout';
import api from '../../services/api';
import SearchBar from '../../components/SearchBar';
import JobList from '../../components/JobList';
import Pagination from '../../components/Pagination';
import JobForm from '../../components/JobForm';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('dashboard');
    
    // Stats state
    const [stats, setStats] = useState({ totalJobs: 0, openJobs: 0, closedJobs: 0 });
    const [loadingStats, setLoadingStats] = useState(false);

    // Jobs state
    const [jobs, setJobs] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchFilters, setSearchFilters] = useState({});
    const [loadingJobs, setLoadingJobs] = useState(false);

    // Form/Detail views
    const [selectedJob, setSelectedJob] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [editingJob, setEditingJob] = useState(null);

    // Candidates state
    const [candidates, setCandidates] = useState([]);
    const [loadingCandidates, setLoadingCandidates] = useState(false);
    const [candidateTotalPages, setCandidateTotalPages] = useState(0);
    const [candidateCurrentPage, setCandidateCurrentPage] = useState(0);
    const [candidateError, setCandidateError] = useState(null);

    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            const res = await api.get('/jobs/stats');
            if (res.data && res.data.success) {
                setStats(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchJobs = async (searchParams = {}, pageNum = 0) => {
        setLoadingJobs(true);
        try {
            const params = {
                page: pageNum,
                size: 5,
                sortBy: 'createdAt',
                sortDir: 'desc',
                ...searchParams
            };
            // Filter out empty params
            Object.keys(params).forEach(key => {
                if (params[key] === null || params[key] === undefined || params[key] === '' || params[key] === 'ALL') {
                    delete params[key];
                }
            });

            const res = await api.get('/jobs', { params });
            if (res.data && res.data.success) {
                setJobs(res.data.data.content);
                setTotalPages(res.data.data.totalPages);
                setCurrentPage(res.data.data.number);
            }
        } catch (err) {
            console.error('Error fetching jobs:', err);
        } finally {
            setLoadingJobs(false);
        }
    };

    const fetchCandidates = async (pageNum = 0) => {
        setLoadingCandidates(true);
        setCandidateError(null);
        try {
            const res = await api.get('/recruiter/candidates', {
                params: {
                    page: pageNum,
                    size: 10
                }
            });
            if (res.data && res.data.success) {
                setCandidates(res.data.data.content);
                setCandidateTotalPages(res.data.data.totalPages);
                setCandidateCurrentPage(res.data.data.number);
            }
        } catch (err) {
            console.error('Error fetching candidates:', err);
            setCandidateError(err.response?.data?.message || 'Failed to fetch candidate directory. Please try again.');
        } finally {
            setLoadingCandidates(false);
        }
    };

    const handleViewResume = async (resumeUrl) => {
        try {
            const response = await api.get(resumeUrl, {
                responseType: 'blob'
            });
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('Error viewing resume:', error);
            alert('Failed to load resume. You may not have permission to view this file.');
        }
    };

    useEffect(() => {
        document.title = "Recruiter Dashboard - ATS";
        if (activeTab === 'dashboard') {
            fetchStats();
        } else if (activeTab === 'jobs') {
            fetchJobs({}, 0);
        } else if (activeTab === 'candidates') {
            fetchCandidates(0);
        }
    }, [activeTab]);

    const handleSearch = (filters) => {
        setSearchFilters(filters);
        fetchJobs(filters, 0);
    };

    const handlePageChange = (newPage) => {
        fetchJobs(searchFilters, newPage);
    };

    const handleCreateSubmit = async (jobData) => {
        try {
            const res = await api.post('/jobs', jobData);
            if (res.data && res.data.success) {
                alert('Job posting created successfully!');
                setIsCreating(false);
                fetchJobs({}, 0);
                fetchStats();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create job posting');
        }
    };

    const handleEditSubmit = async (jobData) => {
        try {
            const res = await api.put(`/jobs/${editingJob.id}`, jobData);
            if (res.data && res.data.success) {
                alert('Job posting updated successfully!');
                setIsEditing(false);
                setEditingJob(null);
                fetchJobs(searchFilters, currentPage);
                fetchStats();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update job posting');
        }
    };

    const handleDelete = async (jobId) => {
        if (window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
            try {
                const res = await api.delete(`/jobs/${jobId}`);
                if (res.data && res.data.success) {
                    alert('Job posting deleted successfully!');
                    fetchJobs(searchFilters, currentPage);
                    fetchStats();
                }
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete job posting');
            }
        }
    };

    const startEdit = (job) => {
        setEditingJob(job);
        setIsEditing(true);
    };

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
            id: 'jobs', 
            label: 'Jobs', 
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
            )
        },

        { 
            id: 'candidates', 
            label: 'Candidates', 
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
            id: 'profile', 
            label: 'Profile', 
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            )
        }
    ];

    return (
        <AppLayout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            navigationItems={navigationItems}
            roleTitle="Recruiter"
            roleColor="var(--success-color)"
        >
            {activeTab === 'dashboard' && (
                <div>
                    <div className="card" style={{ background: 'linear-gradient(135deg, var(--success-light) 0%, rgba(0,0,0,0) 100%)', border: '1px solid var(--border-color)' }}>
                        <div className="card-body" style={{ padding: '2.5rem 2rem' }}>
                            <h1 style={{ marginBottom: '0.5rem', fontWeight: 800 }}>Welcome back, {user?.fullName}!</h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '640px' }}>Manage postings, track application status cycles, and review candidate portfolios seamlessly.</p>
                        </div>
                    </div>

                    {/* Job Stats Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
                        <div className="card" style={{ borderTop: '4px solid var(--primary-color)' }}>
                            <div className="card-body" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', fontWeight: 800 }}>
                                    {loadingStats ? '...' : stats.totalJobs}
                                </h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Jobs</p>
                            </div>
                        </div>
                        <div className="card" style={{ borderTop: '4px solid var(--success-color)' }}>
                            <div className="card-body" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                <h2 style={{ fontSize: '2.5rem', color: 'var(--success-color)', fontWeight: 800 }}>
                                    {loadingStats ? '...' : stats.openJobs}
                                </h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Open Jobs</p>
                            </div>
                        </div>
                        <div className="card" style={{ borderTop: '4px solid var(--danger-color)' }}>
                            <div className="card-body" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                <h2 style={{ fontSize: '2.5rem', color: 'var(--danger-color)', fontWeight: 800 }}>
                                    {loadingStats ? '...' : stats.closedJobs}
                                </h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Closed Jobs</p>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-grid dashboard-grid-2-1" style={{ marginTop: '1.5rem' }}>
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Applicant Activity Summary</h3>
                            </div>
                            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
                                    <div>
                                        <h4 style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Alice Smith</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>Applied for Senior Java Engineer</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn btn-secondary btn-sm" onClick={() => alert('Phase 3 workflow engine integration')}>Schedule Interview</button>
                                        <button className="btn btn-outline btn-sm" onClick={() => alert('Phase 3 profile viewer integration')}>Review Profile</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Workspace Details</h3>
                            </div>
                            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
                                <div>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Operator</span>
                                    <strong style={{ color: 'var(--text-primary)', display: 'block', marginTop: '0.15rem' }}>{user?.fullName}</strong>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company Identifier</span>
                                    <strong style={{ color: 'var(--text-primary)', display: 'block', marginTop: '0.15rem' }}>{user?.email}</strong>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem', display: 'block' }}>System Status</span>
                                    <span className="badge badge-success">Online & Secure</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'jobs' && (
                <div>
                    {!isCreating && !isEditing && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div>
                                    <h2 style={{ fontWeight: 700 }}>Job Postings</h2>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage and edit your company job postings.</p>
                                </div>
                                <button className="btn btn-primary btn-sm" onClick={() => setIsCreating(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <span>✚ Create Job</span>
                                </button>
                            </div>

                            <SearchBar onSearch={handleSearch} showStatusFilter={true} />

                            {loadingJobs ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                                    <div className="card" style={{ height: '140px' }}>
                                        <div className="card-body skeleton" style={{ height: '100%' }}></div>
                                    </div>
                                    <div className="card" style={{ height: '140px' }}>
                                        <div className="card-body skeleton" style={{ height: '100%' }}></div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <JobList 
                                        jobs={jobs} 
                                        onView={setSelectedJob} 
                                        onEdit={startEdit} 
                                        onDelete={handleDelete} 
                                        showActions={true} 
                                    />
                                    <Pagination 
                                        currentPage={currentPage} 
                                        totalPages={totalPages} 
                                        onPageChange={handlePageChange} 
                                    />
                                </>
                            )}
                        </>
                    )}

                    {isCreating && (
                        <JobForm 
                            titleText="Create Job Posting" 
                            onSubmit={handleCreateSubmit} 
                            onCancel={() => setIsCreating(false)} 
                        />
                    )}

                    {isEditing && (
                        <JobForm 
                            titleText="Edit Job Posting" 
                            initialData={editingJob} 
                            onSubmit={handleEditSubmit} 
                            onCancel={() => { setIsEditing(false); setEditingJob(null); }} 
                        />
                    )}
                </div>
            )}



            {activeTab === 'candidates' && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Candidate Directory</h3>
                        <p className="card-subtitle">Global database of all registered system profiles</p>
                    </div>
                    
                    {loadingCandidates ? (
                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="skeleton" style={{ height: '32px' }}></div>
                            <div className="skeleton" style={{ height: '32px' }}></div>
                            <div className="skeleton" style={{ height: '32px' }}></div>
                        </div>
                    ) : candidateError ? (
                        <div className="card-body" style={{ padding: '2rem', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--danger-color)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <span>⚠ {candidateError}</span>
                            <button className="btn btn-secondary btn-sm" onClick={() => fetchCandidates(candidateCurrentPage)}>Retry</button>
                        </div>
                    ) : candidates.length === 0 ? (
                        <div className="card-body" style={{ border: '1px dashed var(--border-color)', borderRadius: '8px', padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Candidate directory is currently empty.
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        <th style={{ padding: '1rem' }}>Candidate Name</th>
                                        <th style={{ padding: '1rem' }}>Email Address</th>
                                        <th style={{ padding: '1rem' }}>Joined Date</th>
                                        <th style={{ padding: '1rem' }}>Resume Status</th>
                                        <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {candidates.map(candidate => (
                                        <tr key={candidate.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem' }} className="table-row-hover">
                                            <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>{candidate.fullName}</td>
                                            <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{candidate.email}</td>
                                            <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                                {new Date(candidate.createdAt).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {candidate.resumeUrl ? (
                                                    <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>Uploaded</span>
                                                ) : (
                                                    <span className="badge badge-danger" style={{ fontSize: '0.75rem' }}>Missing</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                {candidate.resumeUrl ? (
                                                    <button 
                                                        onClick={() => handleViewResume(candidate.resumeUrl)}
                                                        className="btn btn-secondary btn-sm"
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                                    >
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                            <polyline points="7 10 12 15 17 10"></polyline>
                                                            <line x1="12" y1="15" x2="12" y2="3"></line>
                                                        </svg>
                                                        <span>Download</span>
                                                    </button>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No attachments</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {candidateTotalPages > 1 && (
                                <div style={{ padding: '1rem' }}>
                                    <Pagination
                                        currentPage={candidateCurrentPage}
                                        totalPages={candidateTotalPages}
                                        onPageChange={(page) => fetchCandidates(page)}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'profile' && (
                <div className="card" style={{ maxWidth: '600px' }}>
                    <div className="card-header">
                        <h3 className="card-title">Recruiter Workspace Profile</h3>
                        <p className="card-subtitle">Workspace credentials and moderator settings.</p>
                    </div>
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.95rem' }}>
                        <div>
                            <label className="form-label" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                            <strong style={{ color: 'var(--text-primary)', fontSize: '1.05rem', display: 'block', marginTop: '0.25rem' }}>{user?.fullName}</strong>
                        </div>
                        <div>
                            <label className="form-label" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
                            <strong style={{ color: 'var(--text-primary)', fontSize: '1.05rem', display: 'block', marginTop: '0.25rem' }}>{user?.email}</strong>
                        </div>
                        <div>
                            <label className="form-label" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Authorization</label>
                            <strong style={{ color: 'var(--text-primary)', fontSize: '1.05rem', display: 'block', marginTop: '0.25rem' }}>Recruiter Workspace Moderator</strong>
                        </div>
                        <div>
                            <label className="form-label" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Created Date</label>
                            <strong style={{ color: 'var(--text-primary)', fontSize: '1.05rem', display: 'block', marginTop: '0.25rem' }}>{user ? new Date(user.createdAt).toLocaleDateString() : ''}</strong>
                        </div>
                    </div>
                </div>
            )}

            {/* View Details Modal Overlay */}
            {selectedJob && (
                <ViewJobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
            )}
        </AppLayout>
    );
};

const ViewJobDetailsModal = ({ job, onClose }) => {
    const dialogRef = React.useRef(null);
    const closeButtonRef = React.useRef(null);

    React.useEffect(() => {
        if (closeButtonRef.current) {
            closeButtonRef.current.focus();
        }

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        const handleKeyDownTrap = (e) => {
            if (e.key === 'Tab') {
                if (!dialogRef.current) return;
                const focusableElements = dialogRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusableElements.length === 0) return;
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        };
        
        const modalContainer = dialogRef.current;
        modalContainer?.addEventListener('keydown', handleKeyDownTrap);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            modalContainer?.removeEventListener('keydown', handleKeyDownTrap);
        };
    }, [onClose]);

    return (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div 
                ref={dialogRef}
                className="modal-content" 
                role="dialog" 
                aria-modal="true" 
                aria-labelledby="modal-title"
                style={{ borderTop: '4px solid var(--success-color)' }}
            >
                <div className="card-header" style={{ padding: '1.25rem 1.5rem' }}>
                    <h3 id="modal-title" className="card-title">{job.title}</h3>
                    <button 
                        ref={closeButtonRef}
                        className="btn btn-ghost btn-sm" 
                        style={{ padding: 0, width: '28px', height: '28px' }} 
                        onClick={onClose}
                        aria-label="Close details"
                    >
                        ✕
                    </button>
                </div>
                <div className="card-body" style={{ padding: '1.5rem', overflowY: 'auto' }}>
                    <p style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{job.company} — {job.location}</p>
                    
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', margin: '1rem 0' }}>
                        <span className="badge badge-success">{job.employmentType}</span>
                        <span className="badge badge-success">{job.experienceRequired} Experience</span>
                        <span className="badge badge-success">{job.salaryRange}</span>
                        <span className={`badge ${job.status === 'OPEN' ? 'badge-success' : 'badge-danger'}`}>
                            Status: {job.status}
                        </span>
                    </div>

                    <div style={{ margin: '1.5rem 0', lineHeight: '1.6', fontSize: '0.9rem' }}>
                        <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>Job Description:</strong>
                        <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>{job.description}</p>
                    </div>
                </div>
                <div className="card-footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                    <button className="btn btn-secondary btn-sm" onClick={onClose} aria-label="Close dialog">Close</button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
