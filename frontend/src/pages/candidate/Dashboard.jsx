import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import AppLayout from '../../components/AppLayout';
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
            e.target.value = '';
            return;
        }

        const extension = file.name.split('.').pop().toLowerCase();
        if (!['pdf', 'doc', 'docx'].includes(extension)) {
            setResumeMessage({ type: 'error', text: 'Invalid file format. Only PDF, DOC, or DOCX are allowed.' });
            e.target.value = '';
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploadingResume(true);
        setResumeMessage({ type: '', text: '' });

        try {
            const res = await api.post('/candidate/resume', formData);

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
            e.target.value = '';
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
        document.title = "Candidate Dashboard - ATS";
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
            label: 'Available Jobs', 
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
            )
        },
        { 
            id: 'applications', 
            label: 'My Applications', 
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
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
            roleTitle="Candidate"
            roleColor="var(--primary-color)"
        >
            {activeTab === 'dashboard' && (
                <div>
                    <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary-light) 0%, rgba(0,0,0,0) 100%)', border: '1px solid var(--border-color)' }}>
                        <div className="card-body" style={{ padding: '2.5rem 2rem' }}>
                            <h1 style={{ marginBottom: '0.5rem', fontWeight: 800 }}>Welcome back, {user?.fullName}!</h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '640px' }}>Track your active applications, search fresh job postings, and adjust your professional profile credentials instantly.</p>
                        </div>
                    </div>

                    <div className="dashboard-grid dashboard-grid-2-1" style={{ marginTop: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Recently Posted Jobs</h3>
                                </div>
                                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {recentlyPostedJobs.length === 0 ? (
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No recently posted jobs.</p>
                                    ) : (
                                        recentlyPostedJobs.map(job => (
                                            <div key={job.id} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', transition: 'border-color var(--transition-fast)' }}>
                                                <div>
                                                    <h4 style={{ color: 'var(--text-primary)', fontSize: '0.975rem', fontWeight: '600' }}>{job.title}</h4>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{job.company} — {job.location}</p>
                                                </div>
                                                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedJob(job)}>View Details</button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
                                <h2 style={{ fontSize: '2.75rem', color: 'var(--primary-color)', fontWeight: 800 }}>{totalOpenJobs}</h2>
                                <p style={{ color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.9rem', marginTop: '0.25rem' }}>Open Jobs Available</p>
                                <button className="btn btn-outline btn-block btn-sm" style={{ marginTop: '1.5rem' }} onClick={() => setActiveTab('jobs')}>Browse Openings</button>
                            </div>

                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Quick Actions</h3>
                                </div>
                                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <button className="btn btn-secondary btn-sm btn-block" style={{ justifyContent: 'flex-start' }} onClick={() => setActiveTab('profile')}>
                                        Upload Resume
                                    </button>
                                    <button className="btn btn-secondary btn-sm btn-block" style={{ justifyContent: 'flex-start' }} onClick={() => setActiveTab('applications')}>
                                        Check Application Status
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'jobs' && (
                <div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ fontWeight: 700 }}>Available Openings</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Search and apply to open jobs across our organization.</p>
                    </div>
                    <SearchBar onSearch={handleSearch} showStatusFilter={false} />
                    
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
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">My Applications</h3>
                    </div>
                    <div className="card-body">
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Manage and track your submitted applications below.</p>
                        <div style={{ border: '1px dashed var(--border-color)', borderRadius: '8px', padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                            </svg>
                            <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>No active applications</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Browse the Available Jobs tab to submit your first application.</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'profile' && (
                <div className="card" style={{ maxWidth: '640px' }}>
                    <div className="card-header">
                        <h3 className="card-title">Candidate Profile</h3>
                        <p className="card-subtitle">Your personal details and attachments</p>
                    </div>
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                            <div>
                                <label className="form-label" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                                <strong style={{ color: 'var(--text-primary)', fontSize: '1rem', display: 'block', marginTop: '0.25rem' }}>{user?.fullName}</strong>
                            </div>
                            <div>
                                <label className="form-label" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
                                <strong style={{ color: 'var(--text-primary)', fontSize: '1rem', display: 'block', marginTop: '0.25rem' }}>{user?.email}</strong>
                            </div>
                            <div>
                                <label className="form-label" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member Since</label>
                                <strong style={{ color: 'var(--text-primary)', fontSize: '1rem', display: 'block', marginTop: '0.25rem' }}>{user ? new Date(user.createdAt).toLocaleDateString() : ''}</strong>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                            <label className="form-label" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Resume Attachment</label>
                            
                            {user?.resumeUrl ? (
                                <div style={{ marginBottom: '1.25rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-color)' }}>
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14 2 14 8 20 8"></polyline>
                                        </svg>
                                        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)' }}>Attached Resume</span>
                                    </div>
                                    <button 
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => handleViewResume(user.resumeUrl)}
                                    >
                                        View / Download
                                    </button>
                                </div>
                            ) : (
                                <div style={{ marginBottom: '1.25rem', padding: '1.5rem 1rem', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)' }}>
                                    No resume document attached yet. Upload a resume to apply to positions.
                                </div>
                            )}

                            <div className="upload-zone">
                                <span className="upload-zone-icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="17 8 12 3 7 8"></polyline>
                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                    </svg>
                                </span>
                                <span className="upload-zone-text">
                                    {uploadingResume ? 'Uploading resume...' : 'Drag and drop or click to upload your resume'}
                                </span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Supported formats: PDF, DOC, DOCX up to 5MB</span>
                                <input 
                                    type="file" 
                                    accept=".pdf,.doc,.docx" 
                                    onChange={handleResumeUpload} 
                                    style={{ display: 'none' }}
                                    id="resume-file-input"
                                    disabled={uploadingResume}
                                />
                                <label htmlFor="resume-file-input" className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem', pointerEvents: uploadingResume ? 'none' : 'auto' }}>
                                    Choose File
                                </label>
                            </div>

                            {resumeMessage.text && (
                                <div className={`alert ${resumeMessage.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ marginTop: '1rem', padding: '0.75rem 1rem' }}>
                                    <span>{resumeMessage.text}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* View Details Modal Overlay */}
            {selectedJob && (
                <div className="modal-backdrop">
                    <div className="modal-content" style={{ borderTop: '4px solid var(--primary-color)' }}>
                        <div className="card-header" style={{ padding: '1.25rem 1.5rem' }}>
                            <h3 className="card-title">{selectedJob.title}</h3>
                            <button className="btn btn-ghost btn-sm" style={{ padding: 0, width: '28px', height: '28px' }} onClick={() => setSelectedJob(null)}>✕</button>
                        </div>
                        <div className="card-body" style={{ padding: '1.5rem', overflowY: 'auto' }}>
                            <p style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{selectedJob.company} — {selectedJob.location}</p>
                            
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', margin: '1rem 0' }}>
                                <span className="badge badge-info">{selectedJob.employmentType}</span>
                                <span className="badge badge-info">{selectedJob.experienceRequired} Experience</span>
                                <span className="badge badge-info">{selectedJob.salaryRange}</span>
                            </div>

                            <div style={{ margin: '1.5rem 0', lineHeight: '1.6', fontSize: '0.9rem' }}>
                                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>Job Description:</strong>
                                <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>{selectedJob.description}</p>
                            </div>
                        </div>
                        <div className="card-footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedJob(null)}>Close</button>
                            <button className="btn btn-primary btn-sm" onClick={() => handleApply(selectedJob)}>Apply for Job</button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
};

export default Dashboard;
