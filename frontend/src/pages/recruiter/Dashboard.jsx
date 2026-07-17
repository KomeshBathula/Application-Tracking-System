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
    const subDialogRef = React.useRef(null);
    const closeButtonRef = React.useRef(null);
    
    const [modalTab, setModalTab] = React.useState('details');
    
    // Applicants states
    const [applicants, setApplicants] = React.useState([]);
    const [loadingApplicants, setLoadingApplicants] = React.useState(false);
    const [appTotalPages, setAppTotalPages] = React.useState(0);
    const [appCurrentPage, setAppCurrentPage] = React.useState(0);
    const [search, setSearch] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('ALL');
    
    // Update status states
    const [updatingApp, setUpdatingApp] = React.useState(null);
    const [newStatus, setNewStatus] = React.useState('');
    const [notes, setNotes] = React.useState('');
    const [isSavingStatus, setIsSavingStatus] = React.useState(false);
    
    // Timeline states
    const [timelineApp, setTimelineApp] = React.useState(null);
    const [timelineHistory, setTimelineHistory] = React.useState([]);
    const [loadingTimeline, setLoadingTimeline] = React.useState(false);
    const latestRequestRef = React.useRef(0);

    // Alert toast states
    const [subAlertText, setSubAlertText] = React.useState(null);
    const [subAlertType, setSubAlertType] = React.useState('success');

    const showSubNotification = (text, type = 'success') => {
        setSubAlertText(text);
        setSubAlertType(type);
        setTimeout(() => {
            setSubAlertText(null);
        }, 5000);
    };

    const fetchApplicants = async (page = 0, searchVal = search, statusVal = statusFilter) => {
        const requestId = ++latestRequestRef.current;
        setLoadingApplicants(true);
        try {
            const params = {
                page,
                size: 5,
                search: searchVal,
                status: statusVal
            };
            if (statusVal === 'ALL') {
                delete params.status;
            }
            if (!searchVal.trim()) {
                delete params.search;
            }
            const res = await api.get(`/applications/job/${job.id}`, { params });
            if (requestId !== latestRequestRef.current) {
                return; // Stale request, ignore response
            }
            if (res.data && res.data.success) {
                setApplicants(res.data.data.content);
                setAppTotalPages(res.data.data.totalPages);
                setAppCurrentPage(res.data.data.number);
            }
        } catch (err) {
            if (requestId === latestRequestRef.current) {
                console.error('Error fetching applicants:', err);
                showSubNotification('Failed to fetch applicants list.', 'error');
            }
        } finally {
            if (requestId === latestRequestRef.current) {
                setLoadingApplicants(false);
            }
        }
    };

    const handleUpdateStatus = async () => {
        if (isSavingStatus) return;
        if (updatingApp && newStatus === updatingApp.status) {
            showSubNotification('Please select a new status to save changes.', 'error');
            return;
        }
        setIsSavingStatus(true);
        try {
            const res = await api.patch(`/applications/${updatingApp.id}/status`, {
                status: newStatus,
                note: notes
            });
            if (res.data && res.data.success) {
                showSubNotification(`Updated status for ${updatingApp.candidateFullName} to ${newStatus.replace('_', ' ')}!`, 'success');
                setUpdatingApp(null);
                setNotes('');
                fetchApplicants(appCurrentPage, search, statusFilter);
            } else {
                showSubNotification(res.data.message || 'Failed to update application status.', 'error');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update application status.';
            showSubNotification(msg, 'error');
        } finally {
            setIsSavingStatus(false);
        }
    };

    const fetchTimeline = async (app) => {
        setTimelineApp(app);
        setLoadingTimeline(true);
        setTimelineHistory([]);
        try {
            const res = await api.get(`/applications/${app.id}/history`);
            if (res.data && res.data.success) {
                setTimelineHistory(res.data.data);
            } else {
                showSubNotification('Failed to retrieve timeline data.', 'error');
            }
        } catch (err) {
            console.error('Error fetching history:', err);
            showSubNotification('Failed to retrieve timeline data.', 'error');
        } finally {
            setLoadingTimeline(false);
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

    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPLIED':
                return { backgroundColor: 'var(--status-applied)', color: '#ffffff' };
            case 'UNDER_REVIEW':
                return { backgroundColor: 'var(--status-review)', color: '#ffffff' };
            case 'SHORTLISTED':
                return { backgroundColor: 'var(--info-color)', color: '#ffffff' };
            case 'INTERVIEW_SCHEDULED':
                return { backgroundColor: 'var(--status-interview)', color: '#ffffff' };
            case 'INTERVIEWED':
                return { backgroundColor: 'var(--primary-color)', color: '#ffffff' };
            case 'OFFERED':
                return { backgroundColor: 'var(--status-offered)', color: '#ffffff' };
            case 'REJECTED':
                return { backgroundColor: 'var(--status-rejected)', color: '#ffffff' };
            case 'WITHDRAWN':
                return { backgroundColor: 'var(--text-muted)', color: '#ffffff' };
            default:
                return { backgroundColor: 'var(--text-muted)', color: '#ffffff' };
        }
    };

    React.useEffect(() => {
        if (modalTab === 'applicants') {
            fetchApplicants(0, search, statusFilter);
        }
    }, [modalTab]);

    React.useEffect(() => {
        if (closeButtonRef.current) {
            closeButtonRef.current.focus();
        }

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (updatingApp) {
                    if (!isSavingStatus) {
                        setUpdatingApp(null);
                    }
                } else if (timelineApp) {
                    setTimelineApp(null);
                } else {
                    onClose();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        const handleKeyDownTrap = (e) => {
            if (e.key === 'Tab') {
                const activeContainer = updatingApp ? subDialogRef.current : dialogRef.current;
                if (!activeContainer) return;
                
                const focusableElements = activeContainer.querySelectorAll(
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
        
        window.addEventListener('keydown', handleKeyDownTrap);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keydown', handleKeyDownTrap);
        };
    }, [onClose, updatingApp, timelineApp, isSavingStatus]);

    React.useEffect(() => {
        if (updatingApp && subDialogRef.current) {
            const firstInput = subDialogRef.current.querySelector('button, select, textarea, input');
            if (firstInput) {
                firstInput.focus();
            }
        }
    }, [updatingApp]);

    return (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div 
                ref={dialogRef}
                className="modal-content" 
                role="dialog" 
                aria-modal="true" 
                aria-labelledby="modal-title"
                style={{ borderTop: '4px solid var(--success-color)', maxWidth: '800px', width: '95%' }}
            >
                <div className="card-header" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 id="modal-title" className="card-title" style={{ fontSize: '1.25rem' }}>{job.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.15rem' }}>{job.company} — {job.location}</p>
                        </div>
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

                    {/* Tab Navigation */}
                    <div className="tabs" style={{ marginBottom: 0, marginTop: '0.5rem', display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                        <button 
                            className={`tab-item ${modalTab === 'details' ? 'active' : ''}`}
                            onClick={() => setModalTab('details')}
                            style={{ paddingBottom: '0.5rem' }}
                        >
                            Job Details
                        </button>
                        <button 
                            className={`tab-item ${modalTab === 'applicants' ? 'active' : ''}`}
                            onClick={() => setModalTab('applicants')}
                            style={{ paddingBottom: '0.5rem' }}
                        >
                            Applicants
                        </button>
                    </div>
                </div>

                <div className="card-body" style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                    {subAlertText && (
                        <div className={`alert ${subAlertType === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{subAlertText}</span>
                            <button className="btn btn-ghost btn-sm" style={{ padding: '0 4px', height: 'auto', color: 'inherit' }} onClick={() => setSubAlertText(null)}>✕</button>
                        </div>
                    )}

                    {modalTab === 'details' ? (
                        <div>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', margin: '0 0 1.25rem 0' }}>
                                <span className="badge badge-success">{job.employmentType}</span>
                                <span className="badge badge-success">{job.experienceRequired} Experience</span>
                                <span className="badge badge-success">{job.salaryRange}</span>
                                <span className={`badge ${job.status === 'OPEN' ? 'badge-success' : 'badge-danger'}`}>
                                    Status: {job.status}
                                </span>
                            </div>

                            <div style={{ lineHeight: '1.6', fontSize: '0.9rem' }}>
                                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>Job Description:</strong>
                                <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>{job.description}</p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {/* Filters & Search for Applicants */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Search by candidate name..."
                                        style={{ flex: 1, minWidth: '180px', height: '34px', fontSize: '0.85rem' }}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && fetchApplicants(0, search, statusFilter)}
                                    />
                                    <button className="btn btn-primary btn-sm" style={{ height: '34px' }} onClick={() => fetchApplicants(0, search, statusFilter)}>Search</button>
                                    <button className="btn btn-secondary btn-sm" style={{ height: '34px' }} onClick={() => {
                                        setSearch('');
                                        setStatusFilter('ALL');
                                        fetchApplicants(0, '', 'ALL');
                                    }}>Reset</button>
                                </div>
                                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '0.25rem' }}>Status:</span>
                                    {[
                                        { value: 'ALL', label: 'All', color: 'var(--primary-color)', bg: 'rgba(15, 110, 94, 0.08)' },
                                        { value: 'APPLIED', label: 'Applied', color: 'var(--status-applied)', bg: 'rgba(52, 168, 83, 0.08)' },
                                        { value: 'UNDER_REVIEW', label: 'Under Review', color: 'var(--status-review)', bg: 'rgba(251, 188, 5, 0.08)' },
                                        { value: 'SHORTLISTED', label: 'Shortlisted', color: 'var(--info-color)', bg: 'rgba(26, 115, 232, 0.08)' },
                                        { value: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled', color: 'var(--status-interview)', bg: 'rgba(232, 115, 26, 0.08)' },
                                        { value: 'INTERVIEWED', label: 'Interviewed', color: 'var(--primary-color)', bg: 'rgba(15, 110, 94, 0.08)' },
                                        { value: 'OFFERED', label: 'Offered', color: 'var(--status-offered)', bg: 'rgba(15, 110, 94, 0.08)' },
                                        { value: 'REJECTED', label: 'Rejected', color: 'var(--status-rejected)', bg: 'rgba(217, 48, 37, 0.08)' },
                                        { value: 'WITHDRAWN', label: 'Withdrawn', color: 'var(--text-muted)', bg: 'rgba(128, 128, 128, 0.08)' }
                                    ].map(opt => {
                                        const isSelected = statusFilter === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => {
                                                    setStatusFilter(opt.value);
                                                    fetchApplicants(0, search, opt.value);
                                                }}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    padding: '0.35rem 0.65rem',
                                                    borderRadius: '20px',
                                                    border: isSelected ? `1.5px solid ${opt.color}` : '1px solid var(--border-color)',
                                                    backgroundColor: isSelected ? opt.bg : 'transparent',
                                                    color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                    fontWeight: isSelected ? '600' : '400',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s ease',
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                {opt.value !== 'ALL' && (
                                                    <span style={{ 
                                                        width: '6px', 
                                                        height: '6px', 
                                                        borderRadius: '50%', 
                                                        backgroundColor: opt.color, 
                                                        marginRight: '6px',
                                                        display: 'inline-block'
                                                    }} />
                                                )}
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {loadingApplicants ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div className="skeleton" style={{ height: '32px' }}></div>
                                    <div className="skeleton" style={{ height: '32px' }}></div>
                                    <div className="skeleton" style={{ height: '32px' }}></div>
                                </div>
                            ) : applicants.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)' }}>
                                    No applicants found for this position.
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                        <thead>
                                            <tr>
                                                <th>Candidate Name</th>
                                                <th>Resume</th>
                                                <th>Applied Date</th>
                                                <th>Status</th>
                                                <th style={{ textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {applicants.map(app => (
                                                <tr key={app.id}>
                                                    <td style={{ fontWeight: '600' }}>{app.candidateFullName}</td>
                                                    <td>
                                                        {app.resumeUrl ? (
                                                            <button 
                                                                className="btn btn-secondary btn-sm"
                                                                style={{ padding: '0.2rem 0.5rem', height: '26px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                                                                onClick={() => handleViewResume(app.resumeUrl)}
                                                            >
                                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                                    <polyline points="7 10 12 15 17 10"></polyline>
                                                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                                                </svg>
                                                                View
                                                            </button>
                                                        ) : (
                                                            <span style={{ color: 'var(--text-muted)' }}>None</span>
                                                        )}
                                                    </td>
                                                    <td>{new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                                    <td>
                                                        <span className="badge" style={getStatusBadge(app.status)}>
                                                            {app.status.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                                                            <button 
                                                                className="btn btn-primary btn-sm"
                                                                style={{ padding: '0.2rem 0.5rem', height: '26px', fontSize: '0.75rem' }}
                                                                onClick={() => {
                                                                    setUpdatingApp(app);
                                                                    setNewStatus(app.status);
                                                                    setNotes('');
                                                                }}
                                                            >
                                                                Status
                                                            </button>
                                                            <button 
                                                                className="btn btn-outline btn-sm"
                                                                style={{ padding: '0.2rem 0.5rem', height: '26px', fontSize: '0.75rem' }}
                                                                onClick={() => fetchTimeline(app)}
                                                            >
                                                                Timeline
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {appTotalPages > 1 && (
                                        <div style={{ marginTop: '1rem' }}>
                                            <Pagination 
                                                currentPage={appCurrentPage}
                                                totalPages={appTotalPages}
                                                onPageChange={(page) => fetchApplicants(page, search, statusFilter)}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="card-footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                    <button className="btn btn-secondary btn-sm" onClick={onClose} aria-label="Close dialog">Close</button>
                </div>
            </div>

            {/* Nested Status Update Sub-Modal Overlay */}
            {updatingApp && (
                <div 
                    className="modal-backdrop" 
                    style={{ zIndex: 1100 }} 
                    onClick={(e) => e.target === e.currentTarget && !isSavingStatus && setUpdatingApp(null)}
                >
                    <div 
                        ref={subDialogRef} 
                        className="modal-content" 
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="submodal-title"
                        style={{ borderTop: '4px solid var(--primary-color)', maxWidth: '460px' }}
                    >
                        {isSavingStatus ? (
                            <div style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                                <style>{`
                                    @keyframes spin {
                                        0% { transform: rotate(0deg); }
                                        100% { transform: rotate(360deg); }
                                    }
                                `}</style>
                                <div style={{ 
                                    width: '42px', 
                                    height: '42px', 
                                    border: '4px solid var(--border-color)', 
                                    borderTop: '4px solid var(--primary-color)', 
                                    borderRadius: '50%', 
                                    animation: 'spin 1s linear infinite' 
                                }}></div>
                                <h4 style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>Updating Application Status</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Please wait while we notify the candidate...</p>
                            </div>
                        ) : (
                            <>
                                <div className="card-header" style={{ padding: '1rem 1.25rem' }}>
                                    <h4 id="submodal-title" className="card-title" style={{ fontSize: '1rem' }}>Update Application Status</h4>
                                    <button className="btn btn-ghost btn-sm" style={{ padding: 0, width: '24px', height: '24px' }} onClick={() => setUpdatingApp(null)}>✕</button>
                                </div>
                                <div className="card-body" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        Candidate: <strong style={{ color: 'var(--text-primary)' }}>{updatingApp.candidateFullName}</strong>
                                    </p>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 600 }}>Select New Status</label>
                                        <div style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: 'repeat(2, 1fr)', 
                                            gap: '0.5rem', 
                                            marginTop: '0.25rem' 
                                        }}>
                                            {[
                                                { value: 'APPLIED', label: 'Applied', color: 'var(--status-applied)', bg: 'rgba(52, 168, 83, 0.08)' },
                                                { value: 'UNDER_REVIEW', label: 'Under Review', color: 'var(--status-review)', bg: 'rgba(251, 188, 5, 0.08)' },
                                                { value: 'SHORTLISTED', label: 'Shortlisted', color: 'var(--info-color)', bg: 'rgba(26, 115, 232, 0.08)' },
                                                { value: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled', color: 'var(--status-interview)', bg: 'rgba(232, 115, 26, 0.08)' },
                                                { value: 'INTERVIEWED', label: 'Interviewed', color: 'var(--primary-color)', bg: 'rgba(15, 110, 94, 0.08)' },
                                                { value: 'OFFERED', label: 'Offered', color: 'var(--status-offered)', bg: 'rgba(15, 110, 94, 0.08)' },
                                                { value: 'REJECTED', label: 'Rejected', color: 'var(--status-rejected)', bg: 'rgba(217, 48, 37, 0.08)' },
                                                { value: 'WITHDRAWN', label: 'Withdrawn', color: 'var(--text-muted)', bg: 'rgba(128, 128, 128, 0.08)' }
                                            ].map(opt => {
                                                const STATUS_ORDER = {
                                                    'APPLIED': 1,
                                                    'UNDER_REVIEW': 2,
                                                    'SHORTLISTED': 3,
                                                    'INTERVIEW_SCHEDULED': 4,
                                                    'INTERVIEWED': 5,
                                                    'OFFERED': 6,
                                                    'REJECTED': 7,
                                                    'WITHDRAWN': 8
                                                };
                                                const currentStatusVal = updatingApp.status;
                                                const isCurrentTerminal = currentStatusVal === 'REJECTED' || currentStatusVal === 'WITHDRAWN';
                                                
                                                const isSelected = newStatus === opt.value;
                                                const isDisabled = (() => {
                                                    if (isCurrentTerminal) return true;
                                                    if (opt.value === currentStatusVal) return true;
                                                    if (opt.value === 'WITHDRAWN') return true;
                                                    if (opt.value === 'REJECTED') return false;
                                                    const currentOrder = STATUS_ORDER[currentStatusVal] || 0;
                                                    const targetOrder = STATUS_ORDER[opt.value] || 0;
                                                    return targetOrder <= currentOrder;
                                                })();

                                                return (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => setNewStatus(opt.value)}
                                                        disabled={isDisabled}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            padding: '0.6rem 0.75rem',
                                                            borderRadius: '6px',
                                                            border: isSelected ? `2px solid ${opt.color}` : '1px solid var(--border-color)',
                                                            backgroundColor: isSelected ? opt.bg : 'var(--bg-card)',
                                                            color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                            fontWeight: isSelected ? '700' : '400',
                                                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                                                            opacity: isDisabled ? 0.4 : 1,
                                                            pointerEvents: isDisabled ? 'none' : 'auto',
                                                            transition: 'all 0.15s ease',
                                                            fontSize: '0.8rem',
                                                            textAlign: 'left'
                                                        }}
                                                    >
                                                        <span style={{ 
                                                            width: '7px', 
                                                            height: '7px', 
                                                            borderRadius: '50%', 
                                                            backgroundColor: opt.color, 
                                                            marginRight: '8px',
                                                            display: 'inline-block',
                                                            boxShadow: isSelected ? `0 0 6px ${opt.color}` : 'none'
                                                        }} />
                                                        {opt.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Transition Notes (Optional)</label>
                                        <textarea 
                                            className="form-control"
                                            placeholder="Enter details or reason for this status change..."
                                            rows="3"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            style={{ fontSize: '0.85rem' }}
                                        />
                                    </div>
                                </div>
                                <div className="card-footer" style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                                    <button className="btn btn-secondary btn-sm" onClick={() => setUpdatingApp(null)} disabled={isSavingStatus}>Cancel</button>
                                    <button className="btn btn-primary btn-sm" onClick={handleUpdateStatus} disabled={isSavingStatus}>Save Changes</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Nested Application Timeline Audit History Sub-Modal Overlay */}
            {timelineApp && (
                <div className="modal-backdrop" style={{ zIndex: 1100 }} onClick={(e) => e.target === e.currentTarget && setTimelineApp(null)}>
                    <div className="modal-content" style={{ borderTop: '4px solid var(--info-color)', maxWidth: '500px' }}>
                        <div className="card-header" style={{ padding: '1rem 1.25rem' }}>
                            <div>
                                <h4 className="card-title" style={{ fontSize: '1rem' }}>Application History Log</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.15rem' }}>
                                    Candidate: {timelineApp.candidateFullName}
                                </p>
                            </div>
                            <button className="btn btn-ghost btn-sm" style={{ padding: 0, width: '24px', height: '24px' }} onClick={() => setTimelineApp(null)}>✕</button>
                        </div>
                        <div className="card-body" style={{ padding: '1.25rem', maxHeight: '380px', overflowY: 'auto' }}>
                            {loadingTimeline ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div className="skeleton" style={{ height: '20px' }}></div>
                                    <div className="skeleton" style={{ height: '20px' }}></div>
                                    <div className="skeleton" style={{ height: '20px' }}></div>
                                </div>
                            ) : timelineHistory.length === 0 ? (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center' }}>No audit history records available.</p>
                            ) : (
                                <div style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    position: 'relative', 
                                    paddingLeft: '1.25rem', 
                                    borderLeft: '2px solid var(--border-color)', 
                                    gap: '1.25rem', 
                                    margin: '0.5rem' 
                                }}>
                                    {timelineHistory.map((item, index) => (
                                        <div key={item.id} style={{ position: 'relative' }}>
                                            <div style={{ 
                                                position: 'absolute', 
                                                left: '-1.725rem', 
                                                top: '3px',
                                                width: '12px', 
                                                height: '12px', 
                                                borderRadius: '50%', 
                                                backgroundColor: index === timelineHistory.length - 1 ? 'var(--primary-color)' : 'var(--border-hover)', 
                                                border: '2px solid var(--bg-card)'
                                            }} />
                                            
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                                                    <span className="badge" style={{ ...getStatusBadge(item.newStatus), fontSize: '0.65rem', padding: '0.15rem 0.35rem' }}>
                                                        {item.newStatus.replace('_', ' ')}
                                                    </span>
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                        {new Date(item.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                                                    </span>
                                                </div>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                                                    Updated by <strong style={{ color: 'var(--text-primary)' }}>{item.changedByName}</strong> ({item.changedByEmail})
                                                </span>
                                                {item.note && (
                                                    <div style={{ 
                                                        fontSize: '0.8rem', 
                                                        color: 'var(--text-secondary)', 
                                                        backgroundColor: 'var(--bg-secondary)', 
                                                        padding: '0.4rem 0.6rem', 
                                                        borderRadius: '4px', 
                                                        marginTop: '0.25rem', 
                                                        borderLeft: '2px solid var(--primary-color)' 
                                                    }}>
                                                        {item.note}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="card-footer" style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => setTimelineApp(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
