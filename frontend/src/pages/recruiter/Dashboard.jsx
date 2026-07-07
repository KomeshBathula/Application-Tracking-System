import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
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

    return (
        <div className="home-container">
            {/* Header / Navbar */}
            <header className="navbar">
                <div className="navbar-brand">
                    <span className="logo-icon" style={{ color: 'var(--success-color)' }}>▲</span>
                    <span>Application Tracking System</span>
                </div>
                <div className="user-profile-menu">
                    <ThemeToggle />
                    <span className="user-name">{user?.fullName}</span>
                    <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--success-color)' }}>Recruiter</span>
                    <button className="btn btn-secondary btn-sm" onClick={logout}>Sign Out</button>
                </div>
            </header>

            {/* Sidebar & Dashboard Layout */}
            <div style={{ display: 'flex', flex: 1, flexDirection: 'row', minHeight: 'calc(100vh - 70px)' }}>
                {/* Role Specific Navigation */}
                <nav style={{ width: '240px', borderRight: '1px solid var(--border-color)', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button 
                        className="btn" 
                        style={{ justifyContent: 'flex-start', backgroundColor: activeTab === 'dashboard' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'dashboard' ? '#fff' : 'var(--text-primary)' }}
                        onClick={() => { setActiveTab('dashboard'); setIsCreating(false); setIsEditing(false); }}
                    >
                        📋 Dashboard
                    </button>
                    <button 
                        className="btn" 
                        style={{ justifyContent: 'flex-start', backgroundColor: activeTab === 'jobs' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'jobs' ? '#fff' : 'var(--text-primary)' }}
                        onClick={() => { setActiveTab('jobs'); setIsCreating(false); setIsEditing(false); }}
                    >
                        💼 Jobs
                    </button>
                    <button 
                        className="btn" 
                        style={{ justifyContent: 'flex-start', backgroundColor: activeTab === 'applications' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'applications' ? '#fff' : 'var(--text-primary)' }}
                        onClick={() => { setActiveTab('applications'); setIsCreating(false); setIsEditing(false); }}
                    >
                        📁 Applications
                    </button>
                    <button 
                        className="btn" 
                        style={{ justifyContent: 'flex-start', backgroundColor: activeTab === 'candidates' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'candidates' ? '#fff' : 'var(--text-primary)' }}
                        onClick={() => { setActiveTab('candidates'); setIsCreating(false); setIsEditing(false); }}
                    >
                        👥 Candidates
                    </button>
                    <button 
                        className="btn" 
                        style={{ justifyContent: 'flex-start', backgroundColor: activeTab === 'profile' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'profile' ? '#fff' : 'var(--text-primary)' }}
                        onClick={() => { setActiveTab('profile'); setIsCreating(false); setIsEditing(false); }}
                    >
                        👤 Profile
                    </button>
                    <button 
                        className="btn" 
                        style={{ justifyContent: 'flex-start', backgroundColor: 'transparent', color: 'var(--danger-color)', marginTop: 'auto' }}
                        onClick={logout}
                    >
                        🚪 Logout
                    </button>
                </nav>

                {/* Dashboard Tab Panels */}
                <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                    {activeTab === 'dashboard' && (
                        <div>
                            <div className="welcome-banner" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(11, 15, 25, 0.5) 100%)' }}>
                                <h1>Welcome back, {user?.fullName}!</h1>
                                <p>Manage your postings, track candidate status updates, and review applicant applications.</p>
                            </div>

                            {/* Job Stats Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div className="dashboard-card" style={{ textAlign: 'center', borderTop: '4px solid var(--primary-color)' }}>
                                    <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-color)' }}>
                                        {loadingStats ? '...' : stats.totalJobs}
                                    </h2>
                                    <p style={{ color: 'var(--text-secondary)', fontWeight: '500', marginTop: '0.5rem' }}>Total Jobs</p>
                                </div>
                                <div className="dashboard-card" style={{ textAlign: 'center', borderTop: '4px solid var(--success-color)' }}>
                                    <h2 style={{ fontSize: '2.5rem', color: 'var(--success-color)' }}>
                                        {loadingStats ? '...' : stats.openJobs}
                                    </h2>
                                    <p style={{ color: 'var(--text-secondary)', fontWeight: '500', marginTop: '0.5rem' }}>Open Jobs</p>
                                </div>
                                <div className="dashboard-card" style={{ textAlign: 'center', borderTop: '4px solid var(--danger-color)' }}>
                                    <h2 style={{ fontSize: '2.5rem', color: 'var(--danger-color)' }}>
                                        {loadingStats ? '...' : stats.closedJobs}
                                    </h2>
                                    <p style={{ color: 'var(--text-secondary)', fontWeight: '500', marginTop: '0.5rem' }}>Closed Jobs</p>
                                </div>
                            </div>

                            <div className="dashboard-grid">
                                <div className="dashboard-card">
                                    <h3>Applicant Activity Summary</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                        <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
                                            <div>
                                                <h4 style={{ color: 'var(--text-primary)' }}>Alice Smith</h4>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Applied for Senior Java Engineer</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn btn-secondary btn-sm" onClick={() => alert('Phase 3 workflow engine integration')}>Schedule Interview</button>
                                                <button className="btn btn-secondary btn-sm" onClick={() => alert('Phase 3 profile viewer integration')}>Review Profile</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="dashboard-card">
                                    <h3>Workspace details</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', marginTop: '1.2rem' }}>
                                        <p style={{ color: 'var(--text-secondary)' }}>Account Name: <strong style={{ color: 'var(--text-primary)' }}>{user?.fullName}</strong></p>
                                        <p style={{ color: 'var(--text-secondary)' }}>Registered Email: <strong style={{ color: 'var(--text-primary)' }}>{user?.email}</strong></p>
                                        <p style={{ color: 'var(--text-secondary)' }}>Workspace Status: <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--success-color)' }}>Online</span></p>
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
                                        <h2 style={{ color: 'var(--text-primary)' }}>Job Postings</h2>
                                        <button className="btn btn-primary" onClick={() => setIsCreating(true)} style={{ backgroundColor: 'var(--primary-color)', color: '#fff' }}>
                                            ✚ Create New Job
                                        </button>
                                    </div>

                                    <SearchBar onSearch={handleSearch} showStatusFilter={true} />

                                    {loadingJobs ? (
                                        <div className="loading-indicator">
                                            <div className="spinner"></div>
                                            <span>Fetching job postings...</span>
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

                    {activeTab === 'applications' && (
                        <div className="dashboard-card">
                            <h3>Applications Pipeline</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>View, update statuses, and move candidates through the hiring workflow.</p>
                            <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                No candidates have applied to your active jobs yet.
                            </div>
                        </div>
                    )}

                    {activeTab === 'candidates' && (
                        <div className="dashboard-card">
                            <h3>Candidate Database</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Global view of registered candidates and their attached profiles.</p>
                            
                            {loadingCandidates ? (
                                <div className="loading-indicator">
                                    <div className="spinner"></div>
                                    <span>Loading candidate profiles...</span>
                                </div>
                            ) : candidates.length === 0 ? (
                                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    Candidate directory is empty.
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                <th style={{ padding: '0.75rem' }}>Name</th>
                                                <th style={{ padding: '0.75rem' }}>Email</th>
                                                <th style={{ padding: '0.75rem' }}>Joined Date</th>
                                                <th style={{ padding: '0.75rem' }}>Resume Status</th>
                                                <th style={{ padding: '0.75rem' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {candidates.map(candidate => (
                                                <tr key={candidate.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                                                    <td style={{ padding: '0.75rem', fontWeight: '500', color: 'var(--text-primary)' }}>{candidate.fullName}</td>
                                                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{candidate.email}</td>
                                                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>
                                                        {new Date(candidate.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td style={{ padding: '0.75rem' }}>
                                                        {candidate.resumeUrl ? (
                                                            <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--success-color)' }}>Uploaded</span>
                                                        ) : (
                                                            <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger-color)' }}>Missing</span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '0.75rem' }}>
                                                        {candidate.resumeUrl ? (
                                                            <button 
                                                                onClick={() => handleViewResume(candidate.resumeUrl)}
                                                                className="btn btn-secondary btn-sm"
                                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                                            >
                                                                📥 Download
                                                            </button>
                                                        ) : (
                                                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>N/A</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {candidateTotalPages > 1 && (
                                        <Pagination
                                            currentPage={candidateCurrentPage}
                                            totalPages={candidateTotalPages}
                                            onPageChange={(page) => fetchCandidates(page)}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="dashboard-card" style={{ maxWidth: '600px' }}>
                            <h3>Recruiter Workspace Profile</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Workspace credentials and member settings.</p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
                                <div>
                                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', display: 'block' }}>Full Name</label>
                                    <strong style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>{user?.fullName}</strong>
                                </div>
                                <div>
                                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', display: 'block' }}>Email Address</label>
                                    <strong style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>{user?.email}</strong>
                                </div>
                                <div>
                                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', display: 'block' }}>Account Type</label>
                                    <strong style={{ color: 'var(--text-primary)' }}>Recruiter Workspace Moderator</strong>
                                </div>
                                <div>
                                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', display: 'block' }}>Created Date</label>
                                    <strong style={{ color: 'var(--text-primary)' }}>{user ? new Date(user.createdAt).toLocaleDateString() : ''}</strong>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* View Details Modal Overlay */}
            {selectedJob && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="dashboard-card" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-color)', position: 'relative' }}>
                        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{selectedJob.title}</h3>
                        <p style={{ fontWeight: 'bold', margin: '0.5rem 0', color: 'var(--text-primary)' }}>{selectedJob.company} — {selectedJob.location}</p>
                        
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', margin: '1rem 0' }}>
                            <span className="badge">💼 {selectedJob.employmentType}</span>
                            <span className="badge">🎓 {selectedJob.experienceRequired} Experience</span>
                            <span className="badge">💰 {selectedJob.salaryRange}</span>
                            <span className="badge" style={{
                                backgroundColor: selectedJob.status === 'OPEN' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: selectedJob.status === 'OPEN' ? 'var(--success-color)' : 'var(--danger-color)'
                            }}>
                                Status: {selectedJob.status}
                            </span>
                        </div>

                        <div style={{ margin: '1.5rem 0', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>Description:</strong>
                            <p style={{ whiteSpace: 'pre-wrap' }}>{selectedJob.description}</p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1.5rem' }}>
                            <button className="btn btn-secondary" onClick={() => setSelectedJob(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
