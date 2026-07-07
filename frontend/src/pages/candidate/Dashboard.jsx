import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import api from '../../services/api';
import SearchBar from '../../components/SearchBar';
import JobList from '../../components/JobList';
import Pagination from '../../components/Pagination';

const Dashboard = () => {
    const { user, setUser, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [jobs, setJobs] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchFilters, setSearchFilters] = useState({});
    const [loadingJobs, setLoadingJobs] = useState(false);
    const [totalOpenJobs, setTotalOpenJobs] = useState(0);
    const [recentlyPostedJobs, setRecentlyPostedJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [resumeMessage, setResumeMessage] = useState({ type: '', text: '' });

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setResumeMessage({ type: 'error', text: 'File is too large. Maximum size allowed is 5MB.' });
            return;
        }

        const extension = file.name.split('.').pop().toLowerCase();
        if (!['pdf', 'doc', 'docx'].includes(extension)) {
            setResumeMessage({ type: 'error', text: 'Invalid file format. Only PDF, DOC, or DOCX are allowed.' });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploadingResume(true);
        setResumeMessage({ type: '', text: '' });

        try {
            const res = await api.post('/candidate/resume', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data && res.data.success) {
                setUser(res.data.data);
                setResumeMessage({ type: 'success', text: 'Resume uploaded successfully!' });
            } else {
                setResumeMessage({ type: 'error', text: res.data.message || 'Failed to upload resume.' });
            }
        } catch (err) {
            console.error('Error uploading resume:', err);
            setResumeMessage({
                type: 'error',
                text: err.response?.data?.message || 'Failed to upload resume. Please try again.'
            });
        } finally {
            setUploadingResume(false);
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
            // Filter empty properties
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

                // Fetch total open jobs count if no active filter
                if (pageNum === 0 && Object.keys(searchParams).length === 0) {
                    setTotalOpenJobs(res.data.data.totalElements);
                }
            }
        } catch (err) {
            console.error('Error fetching jobs:', err);
        } finally {
            setLoadingJobs(false);
        }
    };

    const fetchRecentlyPosted = async () => {
        try {
            const params = {
                page: 0,
                size: 3,
                sortBy: 'createdAt',
                sortDir: 'desc'
            };
            const res = await api.get('/jobs', { params });
            if (res.data && res.data.success) {
                setRecentlyPostedJobs(res.data.data.content);
            }
        } catch (err) {
            console.error('Error fetching recent jobs:', err);
        }
    };

    // Load initial counts and recent jobs
    useEffect(() => {
        fetchRecentlyPosted();
        fetchJobs({}, 0);
    }, []);

    // Re-fetch when search filters or page changes
    const handleSearch = (filters) => {
        setSearchFilters(filters);
        fetchJobs(filters, 0);
    };

    const handlePageChange = (newPage) => {
        fetchJobs(searchFilters, newPage);
    };

    const handleApply = (job) => {
        alert(`Application for "${job.title}" at "${job.company}" submitted successfully! (Phase 3 application workflow)`);
        setSelectedJob(null);
    };

    return (
        <div className="home-container">
            {/* Header / Navbar */}
            <header className="navbar">
                <div className="navbar-brand">
                    <span className="logo-icon">▲</span>
                    <span>Application Tracking System</span>
                </div>
                <div className="user-profile-menu">
                    <ThemeToggle />
                    <span className="user-name">{user?.fullName}</span>
                    <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary-color)' }}>Candidate</span>
                    <button className="btn btn-secondary btn-sm" onClick={logout}>Sign Out</button>
                </div>
            </header>

            {/* Sidebar & Main Layout */}
            <div style={{ display: 'flex', flex: 1, flexDirection: 'row', minHeight: 'calc(100vh - 70px)' }}>
                {/* Role Specific Sidebar Navigation */}
                <nav style={{ width: '240px', borderRight: '1px solid var(--border-color)', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button 
                        className="btn" 
                        style={{ justifyContent: 'flex-start', backgroundColor: activeTab === 'dashboard' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'dashboard' ? '#fff' : 'var(--text-primary)' }}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        📋 Dashboard
                    </button>
                    <button 
                        className="btn" 
                        style={{ justifyContent: 'flex-start', backgroundColor: activeTab === 'jobs' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'jobs' ? '#fff' : 'var(--text-primary)' }}
                        onClick={() => setActiveTab('jobs')}
                    >
                        🔍 Available Jobs
                    </button>
                    <button 
                        className="btn" 
                        style={{ justifyContent: 'flex-start', backgroundColor: activeTab === 'applications' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'applications' ? '#fff' : 'var(--text-primary)' }}
                        onClick={() => setActiveTab('applications')}
                    >
                        💼 My Applications
                    </button>
                    <button 
                        className="btn" 
                        style={{ justifyContent: 'flex-start', backgroundColor: activeTab === 'profile' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'profile' ? '#fff' : 'var(--text-primary)' }}
                        onClick={() => setActiveTab('profile')}
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
                            <div className="welcome-banner">
                                <h1>Welcome back, {user?.fullName}!</h1>
                                <p>Track your applications, search job opportunities, and update your candidate profile.</p>
                            </div>

                            <div className="dashboard-grid">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div className="dashboard-card">
                                        <h3>Recently Posted Jobs</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                            {recentlyPostedJobs.length === 0 ? (
                                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No recently posted jobs.</p>
                                            ) : (
                                                recentlyPostedJobs.map(job => (
                                                    <div key={job.id} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
                                                        <div>
                                                            <h4 style={{ color: 'var(--text-primary)' }}>{job.title}</h4>
                                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{job.company} — {job.location}</p>
                                                        </div>
                                                        <button className="btn btn-primary btn-sm" onClick={() => setSelectedJob(job)}>View</button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div className="dashboard-card" style={{ textAlign: 'center', padding: '2.5rem' }}>
                                        <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-color)' }}>{totalOpenJobs}</h2>
                                        <p style={{ color: 'var(--text-secondary)', fontWeight: '500', marginTop: '0.5rem' }}>Total Open Jobs Available</p>
                                        <button className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }} onClick={() => setActiveTab('jobs')}>Browse All</button>
                                    </div>

                                    <div className="dashboard-card">
                                        <h3>Quick Links</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                                            <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }} onClick={() => setActiveTab('profile')}>Upload Resume</button>
                                            <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }} onClick={() => setActiveTab('applications')}>Check App Status</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'jobs' && (
                        <div>
                            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Browse Job Openings</h2>
                            <SearchBar onSearch={handleSearch} showStatusFilter={false} />
                            
                            {loadingJobs ? (
                                <div className="loading-indicator">
                                    <div className="spinner"></div>
                                    <span>Fetching current openings...</span>
                                </div>
                            ) : (
                                <>
                                    <JobList 
                                        jobs={jobs} 
                                        onView={setSelectedJob} 
                                        showActions={false} 
                                    />
                                    <Pagination 
                                        currentPage={currentPage} 
                                        totalPages={totalPages} 
                                        onPageChange={handlePageChange} 
                                    />
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'applications' && (
                        <div className="dashboard-card">
                            <h3>My Applications</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Manage and track your submitted applications below.</p>
                            <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                You have not submitted any applications yet. Browse the Available Jobs tab to get started.
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="dashboard-card" style={{ maxWidth: '600px' }}>
                            <h3>Candidate Profile</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Your personal contact info and resume details.</p>
                            
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
                                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', display: 'block' }}>Member Since</label>
                                    <strong style={{ color: 'var(--text-primary)' }}>{user ? new Date(user.createdAt).toLocaleDateString() : ''}</strong>
                                </div>
                                <div>
                                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Resume Attachment</label>
                                    
                                    {user?.resumeUrl ? (
                                        <div style={{ marginBottom: '1rem', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                                📄 Current Resume: 
                                                <button 
                                                    onClick={() => handleViewResume(user.resumeUrl)}
                                                    style={{ 
                                                        marginLeft: '0.5rem', 
                                                        color: 'var(--primary-color)', 
                                                        textDecoration: 'underline', 
                                                        fontWeight: '500',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        padding: 0,
                                                        fontSize: 'inherit',
                                                        fontFamily: 'inherit'
                                                    }}
                                                >
                                                    View / Download
                                                </button>
                                            </span>
                                        </div>
                                    ) : (
                                        <div style={{ marginBottom: '1rem', padding: '0.75rem', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            No resume uploaded yet.
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                                📎 {uploadingResume ? 'Uploading...' : 'Upload New Resume'}
                                                <input 
                                                    type="file" 
                                                    accept=".pdf,.doc,.docx" 
                                                    onChange={handleResumeUpload} 
                                                    style={{ display: 'none' }}
                                                    disabled={uploadingResume}
                                                />
                                            </label>
                                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>PDF, DOC, DOCX up to 5MB</span>
                                        </div>

                                        {resumeMessage.text && (
                                            <div style={{ 
                                                fontSize: '0.85rem', 
                                                color: resumeMessage.type === 'success' ? 'var(--success-color)' : 'var(--danger-color)',
                                                marginTop: '0.25rem',
                                                fontWeight: '500'
                                            }}>
                                                {resumeMessage.type === 'success' ? '✓ ' : '⚠ '}
                                                {resumeMessage.text}
                                            </div>
                                        )}
                                    </div>
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
                        </div>

                        <div style={{ margin: '1.5rem 0', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>Description:</strong>
                            <p style={{ whiteSpace: 'pre-wrap' }}>{selectedJob.description}</p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1.5rem' }}>
                            <button className="btn btn-secondary" onClick={() => setSelectedJob(null)}>Close</button>
                            <button className="btn btn-primary" style={{ backgroundColor: 'var(--primary-color)', color: '#fff' }} onClick={() => handleApply(selectedJob)}>Apply for Job</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
