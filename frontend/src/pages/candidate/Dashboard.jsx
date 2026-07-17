import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import AppLayout from '../../components/AppLayout';
import api from '../../services/api';
import SearchBar from '../../components/SearchBar';
import JobList from '../../components/JobList';
import Pagination from '../../components/Pagination';

const Dashboard = () => {
    const { user, setUser, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('dashboard');
    
    // Jobs state
    const [jobs, setJobs] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchFilters, setSearchFilters] = useState({});
    const [loadingJobs, setLoadingJobs] = useState(false);
    const [totalOpenJobs, setTotalOpenJobs] = useState(0);
    const [recentlyPostedJobs, setRecentlyPostedJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    
    // Resume state
    const [uploadingResume, setUploadingResume] = useState(false);
    const [resumeMessage, setResumeMessage] = useState({ type: '', text: '' });

    // Applications state
    const [appliedJobIds, setAppliedJobIds] = useState(new Set());
    const [applications, setApplications] = useState([]);
    const [appTotalPages, setAppTotalPages] = useState(0);
    const [appCurrentPage, setAppCurrentPage] = useState(0);
    const [appSearch, setAppSearch] = useState('');
    const [appStatus, setAppStatus] = useState('ALL');
    const [loadingApps, setLoadingApps] = useState(false);

    // Withdraw confirmation state
    const [appToWithdraw, setAppToWithdraw] = useState(null);

    // Timeline Modal state
    const [selectedTimelineApp, setSelectedTimelineApp] = useState(null);
    const [timelineHistory, setTimelineHistory] = useState([]);
    const [loadingTimeline, setLoadingTimeline] = useState(false);

    // Interview state
    const [interviews, setInterviews] = useState([]);
    const [loadingInterviews, setLoadingInterviews] = useState(false);

    const getInterviewStatusBadge = (status) => {
        switch (status) {
            case 'SCHEDULED':
                return { backgroundColor: 'var(--warning-light)', color: 'var(--warning-color)' };
            case 'COMPLETED':
                return { backgroundColor: 'var(--success-light)', color: 'var(--success-color)' };
            case 'CANCELLED':
                return { backgroundColor: 'var(--danger-light)', color: 'var(--danger-color)' };
            default:
                return { backgroundColor: 'var(--text-muted)', color: '#ffffff' };
        }
    };

    // Alerts state (custom toasts)
    const [alertText, setAlertText] = useState(null);
    const [alertType, setAlertType] = useState('success');
    const notificationTimeoutRef = useRef(null);

    const showNotification = (text, type = 'success') => {
        if (notificationTimeoutRef.current) {
            clearTimeout(notificationTimeoutRef.current);
        }
        setAlertText(text);
        setAlertType(type);
        notificationTimeoutRef.current = setTimeout(() => {
            setAlertText(null);
            notificationTimeoutRef.current = null;
        }, 5000);
    };

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
            const res = await api.post('/candidate/resume', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data && res.data.success) {
                setUser(res.data.data);
                setResumeMessage({ type: 'success', text: 'Resume uploaded successfully!' });
                showNotification('Resume uploaded successfully!', 'success');
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

    const fetchMyApplications = async (page = 0, searchVal = appSearch, statusVal = appStatus) => {
        setLoadingApps(true);
        try {
            const params = {
                page,
                size: 5,
                sortBy: 'createdAt',
                sortDir: 'desc',
                search: searchVal,
                status: statusVal
            };
            if (statusVal === 'ALL') {
                delete params.status;
            }
            if (!searchVal.trim()) {
                delete params.search;
            }
            const res = await api.get('/applications/me', { params });
            if (res.data && res.data.success) {
                setApplications(res.data.data.content);
                setAppTotalPages(res.data.data.totalPages);
                setAppCurrentPage(res.data.data.number);
            }
        } catch (err) {
            console.error('Error fetching applications:', err);
        } finally {
            setLoadingApps(false);
        }
    };

    const fetchInterviews = async () => {
        setLoadingInterviews(true);
        try {
            const res = await api.get('/interviews/candidate');
            if (res.data && res.data.success) {
                setInterviews(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching candidate interviews:', err);
        } finally {
            setLoadingInterviews(false);
        }
    };

    const loadAppliedIds = async () => {
        try {
            let allAppliedJobs = [];
            let currentPageNum = 0;
            let hasMore = true;

            while (hasMore) {
                const res = await api.get('/applications/me', { params: { page: currentPageNum, size: 100 } });
                if (res.data && res.data.success && res.data.data.content) {
                    allAppliedJobs = [...allAppliedJobs, ...res.data.data.content];
                    if (res.data.data.last) {
                        hasMore = false;
                    } else {
                        currentPageNum++;
                    }
                } else {
                    hasMore = false;
                }
            }

            const ids = new Set(
                allAppliedJobs
                    .filter(app => app.status !== 'WITHDRAWN')
                    .map(app => app.jobId)
            );
            setAppliedJobIds(ids);
        } catch (err) {
            console.error('Error loading applied job IDs:', err);
        }
    };

    // Load initial counts and recent jobs
    useEffect(() => {
        document.title = "Candidate Dashboard - ATS";
        fetchRecentlyPosted();
        fetchJobs({}, 0);
        loadAppliedIds();
        fetchInterviews();
    }, []);

    // Fetch applications or interviews when tab changes
    useEffect(() => {
        if (activeTab === 'applications') {
            fetchMyApplications(0, appSearch, appStatus);
        } else if (activeTab === 'interviews') {
            fetchInterviews();
        }
    }, [activeTab]);

    // Re-fetch when search filters or page changes for Jobs
    const handleSearch = (filters) => {
        setSearchFilters(filters);
        fetchJobs(filters, 0);
    };

    const handlePageChange = (newPage) => {
        fetchJobs(searchFilters, newPage);
    };

    // Candidate Job Submission (Apply to Job)
    const handleApply = async (job) => {
        try {
            const res = await api.post('/applications', { jobId: job.id });
            if (res.data && res.data.success) {
                showNotification(`Application for "${job.title}" submitted successfully!`, 'success');
                
                // Update local applied IDs list
                setAppliedJobIds(prev => {
                    const next = new Set(prev);
                    next.add(job.id);
                    return next;
                });
                
                // Re-fetch applications if active
                if (activeTab === 'applications') {
                    fetchMyApplications(0, appSearch, appStatus);
                }
            } else {
                showNotification(res.data.message || 'Failed to submit application.', 'error');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to submit application. Please upload your resume first.';
            showNotification(msg, 'error');
        } finally {
            setSelectedJob(null);
        }
    };

    // Candidate withdraws application
    const handleWithdraw = async (applicationId) => {
        try {
            const res = await api.delete(`/applications/${applicationId}`);
            if (res.data && res.data.success) {
                showNotification('Application withdrawn successfully.', 'success');
                
                // Reload applied IDs and applications list
                loadAppliedIds();
                fetchMyApplications(0, appSearch, appStatus);
            } else {
                showNotification(res.data.message || 'Failed to withdraw application.', 'error');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to withdraw application. Please try again.';
            showNotification(msg, 'error');
        } finally {
            setAppToWithdraw(null);
        }
    };

    // Retrieve Application Status Timeline Audit Log
    const viewTimeline = async (application) => {
        setSelectedTimelineApp(application);
        setLoadingTimeline(true);
        setTimelineHistory([]);
        try {
            const res = await api.get(`/applications/${application.id}/history`);
            if (res.data && res.data.success) {
                setTimelineHistory(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching application history:', err);
            showNotification('Failed to retrieve timeline history.', 'error');
        } finally {
            setLoadingTimeline(false);
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
            id: 'interviews', 
            label: 'Interviews', 
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
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
            {/* Global Alert Notification Banner */}
            {alertText && (
                <div 
                    className={`alert ${alertType === 'success' ? 'alert-success' : 'alert-danger'}`} 
                    style={{ 
                        marginBottom: '1.5rem', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        animation: 'fadeIn var(--transition-fast) ease-out' 
                    }}
                >
                    <span style={{ fontWeight: 500 }}>{alertText}</span>
                    <button 
                        className="btn btn-ghost btn-sm" 
                        style={{ minWidth: 'auto', padding: '0 6px', height: 'auto', color: 'inherit' }} 
                        onClick={() => setAlertText(null)}
                    >
                        ✕
                    </button>
                </div>
            )}

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
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => setSelectedJob(job)}>View Details</button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            
                            {interviews.filter(i => i.status === 'SCHEDULED').length > 0 && (
                                <div className="card" style={{ borderLeft: '4px solid var(--warning-color)' }}>
                                    <div className="card-header">
                                        <h3 className="card-title">Upcoming Interviews</h3>
                                    </div>
                                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {interviews
                                            .filter(i => i.status === 'SCHEDULED')
                                            .slice(0, 3)
                                            .map(item => (
                                                <div key={item.id} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
                                                    <div>
                                                        <span className="badge badge-warning" style={{ fontSize: '0.65rem', marginBottom: '0.25rem' }}>
                                                            {item.interviewRound.replace('_', ' ')}
                                                        </span>
                                                        <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '600' }}>{item.jobTitle}</h4>
                                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{item.company}</p>
                                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                            📅 {new Date(item.scheduledDateTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} ({item.duration} mins)
                                                        </p>
                                                    </div>
                                                    <div>
                                                        {item.interviewMode === 'ONLINE' && item.meetingLink ? (
                                                            <a href={item.meetingLink} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">Join</a>
                                                        ) : (
                                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                                {item.interviewMode}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            )}
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
                                onApply={handleApply}
                                appliedJobIds={appliedJobIds}
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
                    <div className="card-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
                        <div>
                            <h3 className="card-title">My Applications</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.15rem' }}>Manage and track your submitted applications below.</p>
                        </div>
                        {/* Search and Filters Bar */}
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.5rem' }}>
                            <input 
                                type="text"
                                className="form-control"
                                placeholder="Search by job title or company..."
                                style={{ flex: 1, minWidth: '200px' }}
                                value={appSearch}
                                onChange={(e) => setAppSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchMyApplications(0, appSearch, appStatus)}
                            />
                            <select
                                className="form-control"
                                style={{ width: '180px' }}
                                value={appStatus}
                                onChange={(e) => {
                                    setAppStatus(e.target.value);
                                    fetchMyApplications(0, appSearch, e.target.value);
                                }}
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="APPLIED">Applied</option>
                                <option value="UNDER_REVIEW">Under Review</option>
                                <option value="SHORTLISTED">Shortlisted</option>
                                <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                                <option value="INTERVIEWED">Interviewed</option>
                                <option value="OFFERED">Offered</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="WITHDRAWN">Withdrawn</option>
                            </select>
                            <button 
                                className="btn btn-primary btn-sm"
                                onClick={() => fetchMyApplications(0, appSearch, appStatus)}
                            >
                                Filter
                            </button>
                            <button 
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                    setAppSearch('');
                                    setAppStatus('ALL');
                                    fetchMyApplications(0, '', 'ALL');
                                }}
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        {loadingApps ? (
                            <div style={{ padding: '2rem' }}>
                                <div className="skeleton" style={{ height: '32px', marginBottom: '1rem' }}></div>
                                <div className="skeleton" style={{ height: '32px', marginBottom: '1rem' }}></div>
                                <div className="skeleton" style={{ height: '32px' }}></div>
                            </div>
                        ) : applications.length === 0 ? (
                            <div style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                </svg>
                                <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>No applications found</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Modify your filters or browse available jobs to submit an application.</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th>Job Title</th>
                                            <th>Company</th>
                                            <th>Applied Date</th>
                                            <th>Current Status</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications.map(app => (
                                            <tr key={app.id}>
                                                <td style={{ fontWeight: '600' }}>{app.jobTitle}</td>
                                                <td>{app.company}</td>
                                                <td>{new Date(app.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                                <td>
                                                    <span className="badge" style={getStatusBadge(app.status)}>
                                                        {app.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                                                        <button 
                                                            className="btn btn-outline btn-sm"
                                                            onClick={() => viewTimeline(app)}
                                                        >
                                                            Timeline
                                                        </button>
                                                        {app.status !== 'WITHDRAWN' && (
                                                            <button 
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => setAppToWithdraw(app)}
                                                            >
                                                                Withdraw
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {appTotalPages > 1 && (
                                    <div style={{ padding: '1rem' }}>
                                        <Pagination 
                                            currentPage={appCurrentPage}
                                            totalPages={appTotalPages}
                                            onPageChange={(page) => fetchMyApplications(page, appSearch, appStatus)}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'interviews' && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">My Interviews</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.15rem' }}>Track your upcoming and past interview stages.</p>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        {loadingInterviews ? (
                            <div style={{ padding: '2rem' }}>
                                <div className="skeleton" style={{ height: '32px', marginBottom: '1rem' }}></div>
                                <div className="skeleton" style={{ height: '32px', marginBottom: '1rem' }}></div>
                                <div className="skeleton" style={{ height: '32px' }}></div>
                            </div>
                        ) : interviews.length === 0 ? (
                            <div style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>No interviews scheduled</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>You will see scheduled interviews once recruiters update your stage.</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th>Job Title</th>
                                            <th>Company</th>
                                            <th>Round</th>
                                            <th>Date & Time</th>
                                            <th>Mode</th>
                                            <th>Details</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {interviews.map(item => (
                                            <tr key={item.id}>
                                                <td style={{ fontWeight: '600' }}>{item.jobTitle}</td>
                                                <td>{item.company}</td>
                                                <td>
                                                    <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                                                        {item.interviewRound.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td>{new Date(item.scheduledDateTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} ({item.duration} mins)</td>
                                                <td>
                                                    <span className="badge" style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-primary)', fontSize: '0.7rem' }}>
                                                        {item.interviewMode}
                                                    </span>
                                                </td>
                                                <td>
                                                    {item.interviewMode === 'ONLINE' && item.meetingLink && (
                                                        <a href={item.meetingLink} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>Join Meeting</a>
                                                    )}
                                                    {item.interviewMode === 'OFFLINE' && item.location && (
                                                        <span>📍 {item.location}</span>
                                                    )}
                                                    {item.interviewMode === 'PHONE' && item.location && (
                                                        <span>📞 {item.location}</span>
                                                    )}
                                                    {item.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{item.notes}</div>}
                                                </td>
                                                <td>
                                                    <span className="badge" style={getInterviewStatusBadge(item.status)}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
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
                            {appliedJobIds.has(selectedJob.id) ? (
                                <button className="btn btn-secondary btn-sm" disabled style={{ opacity: 0.7 }}>✓ Already Applied</button>
                            ) : (
                                <button className="btn btn-primary btn-sm" onClick={() => handleApply(selectedJob)}>Apply for Job</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Application Timeline Audit History Modal Overlay */}
            {selectedTimelineApp && (
                <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setSelectedTimelineApp(null)}>
                    <div className="modal-content" style={{ borderTop: '4px solid var(--info-color)', maxWidth: '540px' }}>
                        <div className="card-header" style={{ padding: '1.25rem 1.5rem' }}>
                            <div>
                                <h3 className="card-title" style={{ fontSize: '1.15rem' }}>Application Timeline</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
                                    {selectedTimelineApp.jobTitle} — {selectedTimelineApp.company}
                                </p>
                            </div>
                            <button className="btn btn-ghost btn-sm" style={{ padding: 0, width: '28px', height: '28px' }} onClick={() => setSelectedTimelineApp(null)}>✕</button>
                        </div>
                        <div className="card-body" style={{ padding: '1.5rem', maxHeight: '420px', overflowY: 'auto' }}>
                            {loadingTimeline ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div className="skeleton" style={{ height: '24px' }}></div>
                                    <div className="skeleton" style={{ height: '24px' }}></div>
                                    <div className="skeleton" style={{ height: '24px' }}></div>
                                </div>
                            ) : timelineHistory.length === 0 ? (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center' }}>No history timeline entries available.</p>
                            ) : (
                                <div style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    position: 'relative', 
                                    paddingLeft: '1.5rem', 
                                    borderLeft: '2px solid var(--border-color)', 
                                    gap: '1.5rem', 
                                    margin: '0.5rem 0.5rem 0.5rem 0.5rem' 
                                }}>
                                    {timelineHistory.map((item, index) => (
                                        <div key={item.id} style={{ position: 'relative' }}>
                                            {/* Node circular bullet icon */}
                                            <div style={{ 
                                                position: 'absolute', 
                                                left: '-2.025rem', 
                                                top: '3px',
                                                width: '14px', 
                                                height: '14px', 
                                                borderRadius: '50%', 
                                                backgroundColor: index === timelineHistory.length - 1 ? 'var(--primary-color)' : 'var(--border-hover)', 
                                                border: '3px solid var(--bg-card)',
                                                boxShadow: index === timelineHistory.length - 1 ? '0 0 0 3px var(--primary-light)' : 'none'
                                            }} />
                                            
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    <span className="badge" style={{ ...getStatusBadge(item.newStatus), fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}>
                                                        {item.newStatus.replace('_', ' ')}
                                                    </span>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        {new Date(item.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </span>
                                                </div>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                                                    Updated by <strong style={{ color: 'var(--text-primary)' }}>{item.changedByName}</strong> ({item.changedByEmail})
                                                </span>
                                                {item.note && (
                                                    <div style={{ 
                                                        fontSize: '0.85rem', 
                                                        color: 'var(--text-secondary)', 
                                                        backgroundColor: 'var(--bg-secondary)', 
                                                        padding: '0.5rem 0.75rem', 
                                                        borderRadius: '4px', 
                                                        marginTop: '0.35rem', 
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
                        <div className="card-footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedTimelineApp(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Withdraw Confirmation Modal */}
            {appToWithdraw && (
                <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setAppToWithdraw(null)}>
                    <div className="modal-content" style={{ borderTop: '4px solid var(--status-rejected)', maxWidth: '440px' }}>
                        <div className="card-header" style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--status-rejected)'
                            }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                            </div>
                            <h3 className="card-title" style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Withdraw Application</h3>
                        </div>
                        <div className="card-body" style={{ padding: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                            <p>Are you sure you want to withdraw your application for <strong style={{ color: 'var(--text-primary)' }}>{appToWithdraw.jobTitle}</strong> at <strong style={{ color: 'var(--text-primary)' }}>{appToWithdraw.company}</strong>?</p>
                            <p style={{ marginTop: '0.75rem', padding: '0.6rem 0.8rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', borderLeft: '3px solid var(--status-rejected)', fontSize: '0.85rem' }}>
                                ℹ️ <strong>Note:</strong> Your application will be marked as withdrawn. Recruiters will be notified of the withdrawal, and you can re-apply to this position at any time.
                            </p>
                        </div>
                        <div className="card-footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => setAppToWithdraw(null)}>Cancel</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleWithdraw(appToWithdraw.id)}>Withdraw Application</button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
};

export default Dashboard;
