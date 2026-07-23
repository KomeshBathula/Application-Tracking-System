import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AppLayout from '../../components/AppLayout';
import api from '../../services/api';
import SearchBar from '../../components/SearchBar';
import JobList from '../../components/JobList';
import Pagination from '../../components/Pagination';
import JobForm from '../../components/JobForm';

const Dashboard = ({ section = 'dashboard' }) => {
    const { user, logout, checkUsername } = useContext(AuthContext);
    const navigate = useNavigate();
    const activeTab = section;
    const setActiveTab = (tab) => navigate(`/recruiter/${tab}`);

    // Recruiters Management State (Company Admin)
    const [recruitersData, setRecruitersData] = useState({ content: [], totalPages: 0, totalElements: 0, number: 0 });
    const [recruiterPage, setRecruiterPage] = useState(0);
    const [recruiterSearch, setRecruiterSearch] = useState('');
    const [loadingRecruiters, setLoadingRecruiters] = useState(false);
    const [recruitersError, setRecruitersError] = useState('');

    // Add Recruiter Modal State
    const [showAddRecruiterModal, setShowAddRecruiterModal] = useState(false);
    const [recruiterFullName, setRecruiterFullName] = useState('');
    const [recruiterUsername, setRecruiterUsername] = useState('');
    const [recruiterEmail, setRecruiterEmail] = useState('');
    const [recruiterPassword, setRecruiterPassword] = useState('');
    const [recruiterModalError, setRecruiterModalError] = useState('');
    const [recruiterModalSuccess, setRecruiterModalSuccess] = useState('');
    const [recruiterModalLoading, setRecruiterModalLoading] = useState(false);

    // Username availability status for recruiter modal
    const [recruiterUsernameStatus, setRecruiterUsernameStatus] = useState('idle');
    const [recruiterUsernameMessage, setRecruiterUsernameMessage] = useState('');

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

    // Interviews state
    const [interviews, setInterviews] = useState([]);
    const [loadingInterviews, setLoadingInterviews] = useState(false);
    const [interviewsError, setInterviewsError] = useState(null);

    // AI Settings State
    const [aiConfig, setAiConfig] = useState({
        aiProvider: 'OPENAI',
        modelName: 'gpt-4o',
        apiKey: '',
        temperature: 0.2,
        maxTokens: 2000,
        enabled: false,
        resumeAnalysisPrompt: ''
    });
    const [loadingAiConfig, setLoadingAiConfig] = useState(false);
    const [savingAiConfig, setSavingAiConfig] = useState(false);
    const [testingAiConfig, setTestingAiConfig] = useState(false);
    const [aiError, setAiError] = useState(null);
    const [aiSuccess, setAiSuccess] = useState(null);

    const fetchAiConfig = async () => {
        setLoadingAiConfig(true);
        setAiError(null);
        setAiSuccess(null);
        try {
            const res = await api.get('/company-admin/ai-config');
            if (res.data && res.data.success) {
                setAiConfig(res.data.data || {
                    aiProvider: 'OPENAI',
                    modelName: 'gpt-4o',
                    apiKey: '',
                    temperature: 0.2,
                    maxTokens: 2000,
                    enabled: false,
                    resumeAnalysisPrompt: ''
                });
            }
        } catch (err) {
            console.error('Error fetching AI config:', err);
            setAiError(err.response?.data?.message || 'Failed to fetch AI configuration.');
        } finally {
            setLoadingAiConfig(false);
        }
    };

    const handleSaveAiConfig = async (e) => {
        e.preventDefault();
        setSavingAiConfig(true);
        setAiError(null);
        setAiSuccess(null);
        try {
            const res = await api.post('/company-admin/ai-config', aiConfig);
            if (res.data && res.data.success) {
                setAiConfig(res.data.data);
                setAiSuccess('AI configuration saved successfully!');
            }
        } catch (err) {
            console.error('Error saving AI config:', err);
            setAiError(err.response?.data?.message || 'Failed to save AI configuration.');
        } finally {
            setSavingAiConfig(false);
        }
    };

    const handleTestAiConfig = async () => {
        setTestingAiConfig(true);
        setAiError(null);
        setAiSuccess(null);
        try {
            const res = await api.post('/company-admin/ai-config/test');
            if (res.data && res.data.success) {
                setAiSuccess('AI configuration test connection successful!');
            }
        } catch (err) {
            console.error('Error testing AI config:', err);
            setAiError(err.response?.data?.message || 'AI configuration test connection failed.');
        } finally {
            setTestingAiConfig(false);
        }
    };

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

    const fetchInterviews = async () => {
        setLoadingInterviews(true);
        setInterviewsError(null);
        try {
            const res = await api.get('/interviews/recruiter');
            if (res.data?.success) {
                setInterviews(res.data.data || []);
            } else {
                setInterviewsError(res.data?.message || 'Failed to load interviews. Please try again.');
            }
        } catch (err) {
            console.error('Error fetching recruiter interviews:', err);
            setInterviewsError(err.response?.data?.message || 'Failed to load interviews. Please try again.');
        } finally {
            setLoadingInterviews(false);
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

    const fetchRecruiters = async (page = 0) => {
        setLoadingRecruiters(true);
        setRecruitersError('');
        try {
            const res = await api.get('/company-admin/recruiters', {
                params: { page, size: 10, search: recruiterSearch.trim() || undefined }
            });
            if (res.data && res.data.success && res.data.data) {
                setRecruitersData(res.data.data);
                setRecruiterPage(page);
            }
        } catch (err) {
            setRecruitersError(err.response?.data?.message || 'Failed to fetch recruiters.');
        } finally {
            setLoadingRecruiters(false);
        }
    };

    // Live Username Verification for Recruiter Modal
    useEffect(() => {
        let isCurrent = true;
        if (!recruiterUsername || recruiterUsername.trim().length === 0) {
            setRecruiterUsernameStatus('idle');
            setRecruiterUsernameMessage('');
            return;
        }

        const clean = recruiterUsername.trim().toLowerCase();
        const validFormat = /^[a-zA-Z0-9._]{3,30}$/.test(clean);
        if (!validFormat) {
            setRecruiterUsernameStatus('invalid');
            setRecruiterUsernameMessage('3-30 characters (letters, numbers, underscores, or dots)');
            return;
        }

        setRecruiterUsernameStatus('checking');
        setRecruiterUsernameMessage('Checking availability...');

        const timer = setTimeout(async () => {
            const result = await checkUsername(clean);
            if (isCurrent) {
                if (result.available) {
                    setRecruiterUsernameStatus('available');
                    setRecruiterUsernameMessage('Username is available');
                } else {
                    setRecruiterUsernameStatus('unavailable');
                    setRecruiterUsernameMessage(result.message || 'Username is not available');
                }
            }
        }, 350);

        return () => {
            isCurrent = false;
            clearTimeout(timer);
        };
    }, [recruiterUsername, checkUsername]);

    const handleCreateRecruiter = async (e) => {
        e.preventDefault();
        setRecruiterModalError('');
        setRecruiterModalSuccess('');

        if (!recruiterFullName.trim() || !recruiterEmail.trim() || !recruiterPassword) {
            setRecruiterModalError('All fields are required.');
            return;
        }

        if (recruiterUsernameStatus !== 'available') {
            setRecruiterModalError('Please enter an available username.');
            return;
        }

        setRecruiterModalLoading(true);
        try {
            const res = await api.post('/company-admin/recruiters', {
                fullName: recruiterFullName.trim(),
                username: recruiterUsername.trim().toLowerCase(),
                email: recruiterEmail.trim(),
                password: recruiterPassword
            });

            if (res.data && res.data.success) {
                setRecruiterModalSuccess('Recruiter created successfully! Mandatory first-time password change set.');
                setRecruiterFullName('');
                setRecruiterUsername('');
                setRecruiterEmail('');
                setRecruiterPassword('');
                setRecruiterUsernameStatus('idle');
                fetchRecruiters(0);
                setTimeout(() => {
                    setShowAddRecruiterModal(false);
                    setRecruiterModalSuccess('');
                }, 1500);
            }
        } catch (err) {
            setRecruiterModalError(err.response?.data?.message || 'Failed to create recruiter.');
        } finally {
            setRecruiterModalLoading(false);
        }
    };

    const handleToggleRecruiterStatus = async (recruiterId, currentEnabled) => {
        try {
            await api.patch(`/company-admin/recruiters/${recruiterId}/status?enabled=${!currentEnabled}`);
            fetchRecruiters(recruiterPage);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update recruiter status.');
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
        } else if (activeTab === 'interviews') {
            fetchInterviews();
        } else if (activeTab === 'ai-config') {
            fetchAiConfig();
        } else if (activeTab === 'recruiters') {
            fetchRecruiters(0);
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

    const userRoleClean = user?.role?.replace('ROLE_', '') || 'RECRUITER';
    const isCompanyAdmin = userRoleClean === 'COMPANY_ADMIN';
    const isSuperAdmin = userRoleClean === 'ADMIN';

    const roleTitle = isCompanyAdmin ? 'Company Admin' : isSuperAdmin ? 'Super Admin' : 'Recruiter';
    const roleColor = isCompanyAdmin ? 'var(--primary-color)' : isSuperAdmin ? 'var(--danger-color)' : 'var(--success-color)';

    const navigationItems = isCompanyAdmin ? [
        { 
            id: 'dashboard', 
            label: 'Dashboard', 
            path: '/recruiter/dashboard',
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
            id: 'recruiters', 
            label: 'Recruiters', 
            path: '/recruiter/recruiters',
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="17" y1="11" x2="23" y2="11"></line>
                </svg>
            )
        },
        { 
            id: 'jobs', 
            label: 'Company Jobs', 
            path: '/recruiter/jobs',
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
            )
        },
        {
            id: 'ai-config',
            label: 'AI Settings',
            path: '/recruiter/ai-config',
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
            )
        },
        { 
            id: 'profile', 
            label: 'Profile', 
            path: '/recruiter/profile',
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            )
        }
    ] : [
        { 
            id: 'dashboard', 
            label: 'Dashboard', 
            path: '/recruiter/dashboard',
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
            path: '/recruiter/jobs',
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
            path: '/recruiter/candidates',
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
            id: 'interviews',
            label: 'Interviews',
            path: '/recruiter/interviews',
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
            )
        },
        { 
            id: 'profile', 
            label: 'Profile', 
            path: '/recruiter/profile',
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
            navigationItems={navigationItems}
            roleTitle={roleTitle}
            roleColor={roleColor}
        >
            {activeTab === 'dashboard' && (
                <div>
                    {isCompanyAdmin ? (
                        /* Enterprise Company Admin Dashboard */
                        <div>
                            <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary-light) 0%, rgba(0,0,0,0) 100%)', border: '1px solid var(--border-color)' }}>
                                <div className="card-body" style={{ padding: '2.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h1 style={{ marginBottom: '0.5rem', fontWeight: 800 }}>Company Admin Console: {user?.companyName || 'Enterprise'}</h1>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '640px' }}>Provision recruiters, manage company job listings, and configure multi-provider AI screening parameters.</p>
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setShowAddRecruiterModal(true)}
                                        style={{ fontWeight: 700, padding: '0.75rem 1.25rem' }}
                                    >
                                        + Add Recruiter
                                    </button>
                                </div>
                            </div>

                            <div className="dashboard-grid dashboard-grid-3" style={{ marginTop: '1.5rem' }}>
                                <div className="card">
                                    <div className="card-body" style={{ padding: '1.5rem' }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Company Recruiters</div>
                                        <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--text-primary)' }}>
                                            {recruitersData.totalElements || 0}
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Managed team members</p>
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="card-body" style={{ padding: '1.5rem' }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Job Postings</div>
                                        <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--text-primary)' }}>
                                            {stats.openJobs || 0}
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Company postings online</p>
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="card-body" style={{ padding: '1.5rem' }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AI Screening Engine</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--primary-color)' }}>
                                            {aiConfig.enabled ? (aiConfig.aiProvider || 'Active') : 'Disabled'}
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                            {aiConfig.enabled ? `Model: ${aiConfig.modelName}` : 'Configure in AI Settings'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Standard Recruiter Dashboard */
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

            {activeTab === 'interviews' && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Scheduled Interviews</h3>
                        <p className="card-subtitle">Review the interviews scheduled for your job postings.</p>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        {loadingInterviews ? (
                            <div style={{ padding: '2rem' }}>
                                <div className="skeleton" style={{ height: '32px', marginBottom: '1rem' }}></div>
                                <div className="skeleton" style={{ height: '32px', marginBottom: '1rem' }}></div>
                                <div className="skeleton" style={{ height: '32px' }}></div>
                            </div>
                        ) : interviewsError ? (
                            <div style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--danger-color)' }}>
                                <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{interviewsError}</p>
                                <button className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }} onClick={fetchInterviews}>Retry</button>
                            </div>
                        ) : interviews.length === 0 ? (
                            <div style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>No interviews scheduled</p>
                                <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Interviews you schedule from a candidate application will appear here.</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th>Candidate</th>
                                            <th>Job</th>
                                            <th>Round</th>
                                            <th>Date & Time</th>
                                            <th>Mode</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {interviews.map((interview) => (
                                            <tr key={interview.id}>
                                                <td>
                                                    <strong>{interview.candidateFullName}</strong>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{interview.candidateEmail}</div>
                                                </td>
                                                <td>{interview.jobTitle}</td>
                                                <td>{interview.interviewRound?.replace('_', ' ')}</td>
                                                <td>{new Date(interview.scheduledDateTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</td>
                                                <td>{interview.interviewMode}</td>
                                                <td><span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{interview.status}</span></td>
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

            {activeTab === 'ai-config' && (
                <div className="card" style={{ maxWidth: '800px' }}>
                    <div className="card-header">
                        <h3 className="card-title">AI Resume Screening Settings</h3>
                        <p className="card-subtitle">Configure AI model parameters, custom instruction templates, and access credentials for automated resume analysis.</p>
                    </div>
                    <div className="card-body" style={{ padding: '1.5rem' }}>
                        {loadingAiConfig ? (
                            <div className="skeleton" style={{ height: '300px' }}></div>
                        ) : (
                            <form onSubmit={handleSaveAiConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {aiError && (
                                    <div className="alert alert-danger" style={{ margin: 0 }}>
                                        {aiError}
                                    </div>
                                )}
                                {aiSuccess && (
                                    <div className="alert alert-success" style={{ margin: 0 }}>
                                        {aiSuccess}
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                                    <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
                                        <label className="form-label" htmlFor="aiProvider" style={{ fontWeight: 600 }}>AI Provider</label>
                                        <select
                                            id="aiProvider"
                                            className="form-control"
                                            value={aiConfig.aiProvider || 'OPENAI'}
                                            onChange={(e) => {
                                                const prov = e.target.value;
                                                let defaultModel = 'gpt-4o';
                                                if (prov === 'GROQ') defaultModel = 'llama-3.3-70b-versatile';
                                                else if (prov === 'CLAUDE') defaultModel = 'claude-3-5-sonnet-20241022';
                                                else if (prov === 'GEMINI') defaultModel = 'gemini-1.5-pro';
                                                else if (prov === 'DEEPSEEK') defaultModel = 'deepseek-chat';
                                                setAiConfig({ ...aiConfig, aiProvider: prov, modelName: defaultModel });
                                            }}
                                            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                                        >
                                            <option value="OPENAI">OpenAI (GPT-4o, GPT-3.5)</option>
                                            <option value="GROQ">Groq (Llama 3.3, Mixtral)</option>
                                            <option value="CLAUDE">Anthropic Claude (Sonnet 3.5, Opus)</option>
                                            <option value="GEMINI">Google Gemini (1.5 Pro, Flash)</option>
                                            <option value="DEEPSEEK">DeepSeek (V3 / Coder)</option>
                                        </select>
                                    </div>

                                    <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
                                        <label className="form-label" htmlFor="modelName" style={{ fontWeight: 600 }}>Model Name</label>
                                        <input
                                            type="text"
                                            id="modelName"
                                            className="form-control"
                                            value={aiConfig.modelName || ''}
                                            onChange={(e) => setAiConfig({ ...aiConfig, modelName: e.target.value })}
                                            placeholder="e.g. gpt-4o, llama-3.3-70b-versatile, claude-3-5-sonnet"
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" htmlFor="apiKey" style={{ fontWeight: 600 }}>API Access Key</label>
                                    <input
                                        type="password"
                                        id="apiKey"
                                        className="form-control"
                                        value={aiConfig.apiKey || ''}
                                        onChange={(e) => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                                        placeholder="Enter provider API key (masked after saving)"
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                                    <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
                                        <label className="form-label" htmlFor="temperature" style={{ fontWeight: 600 }}>Temperature ({aiConfig.temperature})</label>
                                        <input
                                            type="range"
                                            id="temperature"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={aiConfig.temperature ?? 0.2}
                                            onChange={(e) => setAiConfig({ ...aiConfig, temperature: parseFloat(e.target.value) })}
                                            style={{ width: '100%', accentColor: 'var(--primary-color)', height: '38px' }}
                                        />
                                    </div>

                                    <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
                                        <label className="form-label" htmlFor="maxTokens" style={{ fontWeight: 600 }}>Max Response Tokens</label>
                                        <input
                                            type="number"
                                            id="maxTokens"
                                            className="form-control"
                                            value={aiConfig.maxTokens ?? 2000}
                                            onChange={(e) => setAiConfig({ ...aiConfig, maxTokens: parseInt(e.target.value) })}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" htmlFor="resumeAnalysisPrompt" style={{ fontWeight: 600 }}>System Instructions / Prompt Template</label>
                                    <textarea
                                        id="resumeAnalysisPrompt"
                                        className="form-control"
                                        rows="6"
                                        value={aiConfig.resumeAnalysisPrompt || ''}
                                        onChange={(e) => setAiConfig({ ...aiConfig, resumeAnalysisPrompt: e.target.value })}
                                        placeholder="Enter instructions for resume grading..."
                                        style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}
                                    />
                                </div>

                                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 0 }}>
                                    <input
                                        type="checkbox"
                                        id="enabled"
                                        checked={aiConfig.enabled || false}
                                        onChange={(e) => setAiConfig({ ...aiConfig, enabled: e.target.checked })}
                                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="enabled" className="form-label" style={{ margin: 0, fontWeight: 600, cursor: 'pointer' }}>
                                        Enable automated AI resume screening for candidate pipeline
                                    </label>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                    <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0.5rem 1rem' }} disabled={savingAiConfig}>
                                        {savingAiConfig ? 'Saving...' : 'Save Configuration'}
                                    </button>
                                    <button type="button" className="btn btn-outline btn-sm" style={{ padding: '0.5rem 1rem' }} onClick={handleTestAiConfig} disabled={testingAiConfig}>
                                        {testingAiConfig ? 'Testing Connection...' : 'Test Connection'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'recruiters' && (
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 className="card-title">Company Recruiters</h3>
                            <p className="card-subtitle">Manage hiring team accounts and access for your enterprise</p>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowAddRecruiterModal(true)}
                            style={{ fontWeight: 600, fontSize: '0.9rem' }}
                        >
                            + Add Recruiter
                        </button>
                    </div>

                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Search Filter */}
                        <div style={{ maxWidth: '360px' }}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search recruiters by name, email, or handle..."
                                value={recruiterSearch}
                                onChange={(e) => setRecruiterSearch(e.target.value)}
                            />
                        </div>

                        {recruitersError && <div className="alert alert-danger">{recruitersError}</div>}

                        {loadingRecruiters ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                Loading company recruiters...
                            </div>
                        ) : recruitersData.content.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                No recruiters found for your company.
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                                            <th style={{ padding: '0.75rem 1rem' }}>Recruiter</th>
                                            <th style={{ padding: '0.75rem 1rem' }}>Handle</th>
                                            <th style={{ padding: '0.75rem 1rem' }}>Email</th>
                                            <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                                            <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recruitersData.content.map(r => (
                                            <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{r.fullName}</td>
                                                <td style={{ padding: '0.85rem 1rem', color: 'var(--primary-color)', fontWeight: 500 }}>@{r.username}</td>
                                                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>{r.email}</td>
                                                <td style={{ padding: '0.85rem 1rem' }}>
                                                    <span className={`badge ${r.enabled ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.75rem' }}>
                                                        {r.enabled ? 'Active' : 'Disabled'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                                                    <button
                                                        className={`btn btn-sm ${r.enabled ? 'btn-ghost' : 'btn-primary'}`}
                                                        onClick={() => handleToggleRecruiterStatus(r.id, r.enabled)}
                                                        style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem' }}
                                                    >
                                                        {r.enabled ? 'Disable' : 'Enable'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination Bar */}
                        {recruitersData.totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    Page {recruitersData.number + 1} of {recruitersData.totalPages}
                                </span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        disabled={recruitersData.number === 0}
                                        onClick={() => fetchRecruiters(recruiterPage - 1)}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        disabled={recruitersData.number >= recruitersData.totalPages - 1}
                                        onClick={() => fetchRecruiters(recruiterPage + 1)}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal: Add Recruiter */}
            {showAddRecruiterModal && (
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
                    <div className="card" style={{ maxWidth: '440px', width: '100%', borderRadius: '14px', backgroundColor: 'var(--bg-primary)' }}>
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 className="card-title" style={{ fontSize: '1.2rem', fontWeight: 700 }}>Add New Recruiter</h3>
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setShowAddRecruiterModal(false)}
                                style={{ fontSize: '1.1rem', lineHeight: 1 }}
                            >
                                ×
                            </button>
                        </div>

                        <div className="card-body">
                            {recruiterModalError && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{recruiterModalError}</div>}
                            {recruiterModalSuccess && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{recruiterModalSuccess}</div>}

                            <form onSubmit={handleCreateRecruiter} noValidate>
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label className="form-label" htmlFor="recFullName">Full Name</label>
                                    <input
                                        type="text"
                                        id="recFullName"
                                        className="form-control"
                                        placeholder="e.g. Alex Morgan"
                                        value={recruiterFullName}
                                        onChange={(e) => setRecruiterFullName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <label className="form-label" htmlFor="recUsername">Username Handle</label>
                                        {recruiterUsernameStatus !== 'idle' && (
                                            <span style={{
                                                fontSize: '0.78rem',
                                                fontWeight: 600,
                                                color: recruiterUsernameStatus === 'available' ? 'var(--success-color)' :
                                                       recruiterUsernameStatus === 'checking' ? 'var(--text-secondary)' : 'var(--danger-color)'
                                            }}>
                                                {recruiterUsernameMessage}
                                            </span>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        id="recUsername"
                                        className="form-control"
                                        placeholder="alex_recruiter"
                                        value={recruiterUsername}
                                        onChange={(e) => setRecruiterUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                                        required
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label className="form-label" htmlFor="recEmail">Work Email</label>
                                    <input
                                        type="email"
                                        id="recEmail"
                                        className="form-control"
                                        placeholder="alex@company.com"
                                        value={recruiterEmail}
                                        onChange={(e) => setRecruiterEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                    <label className="form-label" htmlFor="recPassword">Initial Default Password</label>
                                    <input
                                        type="password"
                                        id="recPassword"
                                        className="form-control"
                                        placeholder="Default password (User updates on 1st login)"
                                        value={recruiterPassword}
                                        onChange={(e) => setRecruiterPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowAddRecruiterModal(false)}
                                        style={{ flex: 1 }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={recruiterModalLoading || recruiterUsernameStatus !== 'available'}
                                        style={{ flex: 2, fontWeight: 700 }}
                                    >
                                        {recruiterModalLoading ? 'Adding...' : 'Add Recruiter'}
                                    </button>
                                </div>
                            </form>
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
    
    // AI Resume Screening States
    const [screeningAppId, setScreeningAppId] = React.useState(null);
    const [selectedScreeningReport, setSelectedScreeningReport] = React.useState(null);

    const handleRunAiScreen = async (appId) => {
        setScreeningAppId(appId);
        try {
            const res = await api.post(`/screening/${appId}`);
            if (res.data && res.data.success) {
                showSubNotification('AI Screening completed successfully!', 'success');
                fetchApplicants(appCurrentPage, search, statusFilter);
            } else {
                showSubNotification(res.data.message || 'AI Screening failed.', 'error');
            }
        } catch (err) {
            console.error('Error running AI screen:', err);
            showSubNotification(err.response?.data?.message || 'AI Screening execution failed.', 'error');
        } finally {
            setScreeningAppId(null);
        }
    };

    const handleViewAiReport = async (appId) => {
        try {
            const res = await api.get(`/screening/${appId}`);
            if (res.data && res.data.success) {
                setSelectedScreeningReport(res.data.data);
            } else {
                showSubNotification(res.data.message || 'Failed to fetch AI report.', 'error');
            }
        } catch (err) {
            console.error('Error fetching AI report:', err);
            showSubNotification(err.response?.data?.message || 'Failed to retrieve AI report details.', 'error');
        }
    };

    const getRecommendationBadgeStyle = (rec) => {
        switch (rec) {
            case 'HIGHLY_RECOMMENDED':
                return { backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' };
            case 'RECOMMENDED':
                return { backgroundColor: 'rgba(79, 70, 229, 0.15)', color: '#4f46e5', border: '1px solid rgba(79, 70, 229, 0.3)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' };
            case 'NEEDS_MANUAL_REVIEW':
                return { backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' };
            case 'LOW_MATCH':
                return { backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' };
            default:
                return { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem' };
        }
    };

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

    // Selected Application for detail management modal
    const [selectedApp, setSelectedApp] = React.useState(null);
    const [appTab, setAppTab] = React.useState('pipeline'); // 'pipeline', 'schedule', 'notes', 'history'

    // Interviews states
    const [appInterviews, setAppInterviews] = React.useState([]);
    const [loadingAppInterviews, setLoadingAppInterviews] = React.useState(false);
    const [interviewers, setInterviewers] = React.useState([]);
    const [editingInterview, setEditingInterview] = React.useState(null);

    // Form inputs for scheduling/rescheduling
    const [schedRound, setSchedRound] = React.useState('HR');
    const [schedMode, setSchedMode] = React.useState('ONLINE');
    const [schedScheduledAt, setSchedScheduledAt] = React.useState('');
    const [schedDuration, setSchedDuration] = React.useState(45);
    const [schedInterviewerId, setSchedInterviewerId] = React.useState('');
    const [schedMeetingLink, setSchedMeetingLink] = React.useState('');
    const [schedLocation, setSchedLocation] = React.useState('');
    const [schedNotes, setSchedNotes] = React.useState('');
    const [isSavingInterview, setIsSavingInterview] = React.useState(false);
    const [cancelNote, setCancelNote] = React.useState('');
    const [cancellingInterviewId, setCancellingInterviewId] = React.useState(null);

    // Recruiter Notes states
    const [notesList, setNotesList] = React.useState([]);
    const [loadingNotes, setLoadingNotes] = React.useState(false);
    const [newNoteContent, setNewNoteContent] = React.useState('');
    const [savingNote, setSavingNote] = React.useState(false);
    const [editingNoteId, setEditingNoteId] = React.useState(null);
    const [editingNoteContent, setEditingNoteContent] = React.useState('');

    const fetchAppNotes = async (appId) => {
        setLoadingNotes(true);
        try {
            const res = await api.get(`/notes/application/${appId}`);
            if (res.data && res.data.success) {
                setNotesList(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching app notes:', err);
        } finally {
            setLoadingNotes(false);
        }
    };

    const handleCreateNote = async (e) => {
        e.preventDefault();
        if (!newNoteContent.trim()) return;
        setSavingNote(true);
        try {
            const res = await api.post('/notes', {
                applicationId: selectedApp.id,
                content: newNoteContent
            });
            if (res.data && res.data.success) {
                setNewNoteContent('');
                fetchAppNotes(selectedApp.id);
                showSubNotification('Note added successfully!', 'success');
            } else {
                showSubNotification(res.data.message || 'Failed to add note.', 'error');
            }
        } catch (err) {
            console.error('Error creating note:', err);
            showSubNotification(err.response?.data?.message || 'Failed to add note.', 'error');
        } finally {
            setSavingNote(false);
        }
    };

    const handleUpdateNote = async (noteId) => {
        if (!editingNoteContent.trim()) return;
        setSavingNote(true);
        try {
            const res = await api.put(`/notes/${noteId}`, {
                content: editingNoteContent
            });
            if (res.data && res.data.success) {
                setEditingNoteId(null);
                setEditingNoteContent('');
                fetchAppNotes(selectedApp.id);
                showSubNotification('Note updated successfully!', 'success');
            } else {
                showSubNotification(res.data.message || 'Failed to update note.', 'error');
            }
        } catch (err) {
            console.error('Error updating note:', err);
            showSubNotification(err.response?.data?.message || 'Failed to update note.', 'error');
        } finally {
            setSavingNote(false);
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (!window.confirm('Are you sure you want to delete this note?')) return;
        try {
            const res = await api.delete(`/notes/${noteId}`);
            if (res.data && res.data.success) {
                fetchAppNotes(selectedApp.id);
                showSubNotification('Note deleted successfully!', 'success');
            } else {
                showSubNotification(res.data.message || 'Failed to delete note.', 'error');
            }
        } catch (err) {
            console.error('Error deleting note:', err);
            showSubNotification(err.response?.data?.message || 'Failed to delete note.', 'error');
        }
    };

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

    const fetchAppInterviews = async (appId) => {
        setLoadingAppInterviews(true);
        try {
            const res = await api.get(`/interviews/application/${appId}`);
            if (res.data && res.data.success) {
                setAppInterviews(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching app interviews:', err);
        } finally {
            setLoadingAppInterviews(false);
        }
    };

    const fetchInterviewers = async () => {
        try {
            const res = await api.get('/recruiter/interviewers');
            if (res.data && res.data.success) {
                setInterviewers(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching interviewers:', err);
        }
    };

    const resetSchedForm = () => {
        setEditingInterview(null);
        setSchedRound('HR');
        setSchedMode('ONLINE');
        setSchedScheduledAt('');
        setSchedDuration(45);
        setSchedInterviewerId('');
        setSchedMeetingLink('');
        setSchedLocation('');
        setSchedNotes('');
    };

    const startEditInterview = (item) => {
        setEditingInterview(item);
        setSchedRound(item.interviewRound);
        setSchedMode(item.interviewMode);
        if (item.scheduledDateTime) {
            setSchedScheduledAt(item.scheduledDateTime.substring(0, 16));
        } else {
            setSchedScheduledAt('');
        }
        setSchedDuration(item.duration);
        setSchedInterviewerId(item.interviewerId || '');
        setSchedMeetingLink(item.meetingLink || '');
        setSchedLocation(item.location || '');
        setSchedNotes(item.notes || '');
        setAppTab('schedule');
    };

    const handleSaveInterview = async (e) => {
        e.preventDefault();
        if (!schedScheduledAt) {
            alert('Please select date and time.');
            return;
        }
        if (!schedInterviewerId) {
            alert('Please select an interviewer.');
            return;
        }
        setIsSavingInterview(true);

        let formattedScheduledAt = schedScheduledAt;
        if (formattedScheduledAt.length === 16) {
            formattedScheduledAt += ':00';
        }

        const payload = {
            interviewRound: schedRound,
            interviewMode: schedMode,
            scheduledDateTime: formattedScheduledAt,
            duration: parseInt(schedDuration),
            interviewerId: parseInt(schedInterviewerId),
            meetingLink: schedMode === 'ONLINE' ? schedMeetingLink : null,
            location: schedMode !== 'ONLINE' ? schedLocation : null,
            notes: schedNotes
        };

        if (editingInterview) {
            payload.status = editingInterview.status;
        } else {
            payload.applicationId = selectedApp.id;
        }

        try {
            let res;
            if (editingInterview) {
                res = await api.put(`/interviews/${editingInterview.id}`, payload);
            } else {
                res = await api.post('/interviews', payload);
            }

            if (res.data && res.data.success) {
                showSubNotification(
                    editingInterview ? 'Interview updated successfully!' : 'Interview scheduled successfully!',
                    'success'
                );
                resetSchedForm();
                fetchAppInterviews(selectedApp.id);
                fetchApplicants(appCurrentPage, search, statusFilter);
                setAppTab('pipeline');
            } else {
                showSubNotification(res.data.message || 'Failed to save interview schedule.', 'error');
            }
        } catch (err) {
            console.error('Error saving interview:', err);
            showSubNotification(err.response?.data?.message || 'Failed to save interview schedule.', 'error');
        } finally {
            setIsSavingInterview(false);
        }
    };

    const handleCancelInterview = async () => {
        if (!cancellingInterviewId) return;
        try {
            const res = await api.post(`/interviews/${cancellingInterviewId}/cancel`, null, {
                params: { note: cancelNote }
            });
            if (res.data && res.data.success) {
                showSubNotification('Interview cancelled successfully!', 'success');
                setCancellingInterviewId(null);
                setCancelNote('');
                fetchAppInterviews(selectedApp.id);
                fetchApplicants(appCurrentPage, search, statusFilter);
            } else {
                showSubNotification(res.data.message || 'Failed to cancel interview.', 'error');
            }
        } catch (err) {
            console.error('Error cancelling interview:', err);
            showSubNotification(err.response?.data?.message || 'Failed to cancel interview.', 'error');
        }
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
            fetchInterviewers();
        }
    }, [modalTab]);

    React.useEffect(() => {
        if (selectedApp) {
            fetchAppInterviews(selectedApp.id);
            fetchTimeline(selectedApp);
            fetchAppNotes(selectedApp.id);
            setNewStatus(selectedApp.status);
            setNotes('');
        }
    }, [selectedApp]);

    React.useEffect(() => {
        if (closeButtonRef.current) {
            closeButtonRef.current.focus();
        }

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (cancellingInterviewId) {
                    setCancellingInterviewId(null);
                } else if (selectedApp) {
                    setSelectedApp(null);
                } else if (updatingApp) {
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
                const activeContainer = selectedApp ? dialogRef.current : (updatingApp ? subDialogRef.current : dialogRef.current);
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
                                                <th>AI Match</th>
                                                <th style={{ textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {applicants.map(app => (
                                                <tr key={app.id}>
                                                    <td style={{ fontWeight: '600' }}>
                                                        <button 
                                                            className="btn btn-link btn-sm"
                                                            style={{ padding: 0, height: 'auto', minWidth: 'auto', fontWeight: '600', color: 'var(--primary-color)', textAlign: 'left' }}
                                                            onClick={() => {
                                                                setSelectedApp(app);
                                                                setAppTab('pipeline');
                                                            }}
                                                        >
                                                            {app.candidateFullName}
                                                        </button>
                                                    </td>
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
                                                    <td>
                                                        {screeningAppId === app.id ? (
                                                            <span style={{ color: 'var(--primary-color)', fontSize: '0.75rem', fontWeight: 600 }}>Screening...</span>
                                                        ) : app.aiOverallScore !== null && app.aiOverallScore !== undefined ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                                <span 
                                                                    className="badge" 
                                                                    style={getRecommendationBadgeStyle(app.aiRecommendation)}
                                                                    onClick={() => handleViewAiReport(app.id)}
                                                                    title="Click to view AI report"
                                                                >
                                                                    {app.aiRecommendation.replace(/_/g, ' ')}
                                                                </span>
                                                                <strong style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{app.aiOverallScore}%</strong>
                                                            </div>
                                                        ) : app.resumeUrl ? (
                                                            <button 
                                                                className="btn btn-outline btn-sm"
                                                                style={{ padding: '0.15rem 0.4rem', height: '24px', fontSize: '0.7rem', color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
                                                                onClick={() => handleRunAiScreen(app.id)}
                                                            >
                                                                ⚡ Screen
                                                            </button>
                                                        ) : (
                                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No Resume</span>
                                                        )}
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                                                            <button 
                                                                className="btn btn-primary btn-sm"
                                                                style={{ padding: '0.2rem 0.5rem', height: '26px', fontSize: '0.75rem' }}
                                                                onClick={() => {
                                                                    setSelectedApp(app);
                                                                    setAppTab('pipeline');
                                                                }}
                                                            >
                                                                Manage
                                                            </button>
                                                            <button 
                                                                className="btn btn-outline btn-sm"
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

            {/* Selected Application Details Modal Overlay */}
            {selectedApp && (
                <div className="modal-backdrop" style={{ zIndex: 1100 }} onClick={(e) => e.target === e.currentTarget && setSelectedApp(null)}>
                    <div className="modal-content" style={{ borderTop: '4px solid var(--primary-color)', maxWidth: '700px', width: '95%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
                        <div className="card-header" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h4 className="card-title" style={{ fontSize: '1.1rem' }}>Manage Candidate: {selectedApp.candidateFullName}</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
                                    Applied for {job.title} — {new Date(selectedApp.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <button className="btn btn-ghost btn-sm" style={{ padding: 0, width: '24px', height: '24px' }} onClick={() => setSelectedApp(null)}>✕</button>
                        </div>
                        
                        {/* Inner Tabs */}
                        <div className="tabs" style={{ margin: '0 1.25rem', display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
                            <button className={`tab-item ${appTab === 'pipeline' ? 'active' : ''}`} onClick={() => setAppTab('pipeline')}>Pipeline & Status</button>
                            <button className={`tab-item ${appTab === 'schedule' ? 'active' : ''}`} onClick={() => { setAppTab('schedule'); resetSchedForm(); }}>Schedule Interview</button>
                            <button className={`tab-item ${appTab === 'notes' ? 'active' : ''}`} onClick={() => setAppTab('notes')}>Internal Notes</button>
                            <button className={`tab-item ${appTab === 'history' ? 'active' : ''}`} onClick={() => setAppTab('history')}>Activity Log</button>
                        </div>

                        <div className="card-body" style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
                            
                            {appTab === 'pipeline' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {/* Status update section */}
                                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', backgroundColor: 'var(--bg-secondary)' }}>
                                        <h5 style={{ marginBottom: '0.75rem', fontWeight: 600 }}>Update Application Status</h5>
                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                            <div style={{ flex: 1, minWidth: '180px' }}>
                                                <select 
                                                    className="form-control"
                                                    value={newStatus}
                                                    onChange={(e) => setNewStatus(e.target.value)}
                                                    style={{ fontSize: '0.85rem' }}
                                                >
                                                    <option value="APPLIED">Applied</option>
                                                    <option value="UNDER_REVIEW">Under Review</option>
                                                    <option value="SHORTLISTED">Shortlisted</option>
                                                    <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                                                    <option value="INTERVIEWED">Interviewed</option>
                                                    <option value="OFFERED">Offered</option>
                                                    <option value="REJECTED">Rejected</option>
                                                </select>
                                            </div>
                                            <div style={{ flex: 2, minWidth: '240px' }}>
                                                <input 
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Add status notes (optional)..."
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                    style={{ fontSize: '0.85rem' }}
                                                />
                                            </div>
                                            <button 
                                                className="btn btn-primary btn-sm"
                                                onClick={async () => {
                                                    setUpdatingApp(selectedApp);
                                                    await handleUpdateStatus();
                                                    setSelectedApp(prev => ({ ...prev, status: newStatus }));
                                                }}
                                                disabled={newStatus === selectedApp.status}
                                            >
                                                Update
                                            </button>
                                        </div>
                                    </div>

                                    {/* Scheduled Interviews section */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <h5 style={{ fontWeight: 600 }}>Scheduled Interviews</h5>
                                            <button className="btn btn-secondary btn-sm" onClick={() => { resetSchedForm(); setAppTab('schedule'); }}>
                                                + Schedule
                                            </button>
                                        </div>
                                        
                                        {loadingAppInterviews ? (
                                            <div className="skeleton" style={{ height: '80px' }}></div>
                                        ) : appInterviews.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '2rem 1rem', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                No interviews scheduled yet for this application.
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                {appInterviews.map(item => (
                                                    <div key={item.id} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', backgroundColor: 'var(--bg-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div>
                                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                                <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                                                                    {item.interviewRound.replace('_', ' ')}
                                                                </span>
                                                                <span className="badge" style={getInterviewStatusBadge(item.status)}>
                                                                    {item.status}
                                                                </span>
                                                            </div>
                                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                                                                Interviewer: {item.interviewerFullName} ({item.interviewerEmail})
                                                            </p>
                                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                                                                📅 {new Date(item.scheduledDateTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} ({item.duration} mins)
                                                            </p>
                                                            {item.interviewMode === 'ONLINE' && item.meetingLink && (
                                                                <p style={{ fontSize: '0.8rem', marginTop: '0.15rem' }}>
                                                                    💻 Link: <a href={item.meetingLink} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>{item.meetingLink}</a>
                                                                </p>
                                                            )}
                                                            {item.interviewMode !== 'ONLINE' && item.location && (
                                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                                                                    📍 {item.location}
                                                                </p>
                                                            )}
                                                            {item.notes && (
                                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', paddingLeft: '0.5rem', borderLeft: '2px solid var(--border-color)' }}>
                                                                    Note: {item.notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                        
                                                        {item.status === 'SCHEDULED' && (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                                <button className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', height: '26px', fontSize: '0.75rem' }} onClick={() => startEditInterview(item)}>
                                                                    Reschedule
                                                                </button>
                                                                <button className="btn btn-danger btn-sm" style={{ padding: '0.2rem 0.5rem', height: '26px', fontSize: '0.75rem' }} onClick={() => setCancellingInterviewId(item.id)}>
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {appTab === 'schedule' && (
                                <form onSubmit={handleSaveInterview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <h5 style={{ fontWeight: 600 }}>{editingInterview ? 'Reschedule Interview' : 'Schedule New Interview'}</h5>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label form-label-required">Interview Round</label>
                                            <select 
                                                className="form-control"
                                                value={schedRound}
                                                onChange={(e) => setSchedRound(e.target.value)}
                                                required
                                            >
                                                <option value="HR">HR Round</option>
                                                <option value="TECHNICAL">Technical Round</option>
                                                <option value="MANAGERIAL">Managerial Round</option>
                                                <option value="FINAL">Final Round</option>
                                                <option value="CUSTOM">Custom Round</option>
                                            </select>
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label form-label-required">Interview Mode</label>
                                            <select 
                                                className="form-control"
                                                value={schedMode}
                                                onChange={(e) => setSchedMode(e.target.value)}
                                                required
                                            >
                                                <option value="ONLINE">Online</option>
                                                <option value="OFFLINE">Offline (In-Person)</option>
                                                <option value="PHONE">Phone Screen</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label form-label-required">Date & Time</label>
                                            <input 
                                                type="datetime-local"
                                                className="form-control"
                                                value={schedScheduledAt}
                                                onChange={(e) => setSchedScheduledAt(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label form-label-required">Duration (Minutes)</label>
                                            <select 
                                                className="form-control"
                                                value={schedDuration}
                                                onChange={(e) => setSchedDuration(e.target.value)}
                                                required
                                            >
                                                <option value="15">15 Minutes</option>
                                                <option value="30">30 Minutes</option>
                                                <option value="45">45 Minutes</option>
                                                <option value="60">60 Minutes</option>
                                                <option value="90">90 Minutes</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label form-label-required">Interviewer</label>
                                        <select 
                                            className="form-control"
                                            value={schedInterviewerId}
                                            onChange={(e) => setSchedInterviewerId(e.target.value)}
                                            required
                                        >
                                            <option value="">Select Interviewer...</option>
                                            {interviewers.map(u => (
                                                <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                                            ))}
                                        </select>
                                    </div>

                                    {schedMode === 'ONLINE' ? (
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Meeting Link</label>
                                            <input 
                                                type="url"
                                                className="form-control"
                                                placeholder="https://meet.google.com/xyz..."
                                                value={schedMeetingLink}
                                                onChange={(e) => setSchedMeetingLink(e.target.value)}
                                            />
                                        </div>
                                    ) : (
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">{schedMode === 'OFFLINE' ? 'Office Location / Room' : 'Phone Number'}</label>
                                            <input 
                                                type="text"
                                                className="form-control"
                                                placeholder={schedMode === 'OFFLINE' ? 'Conference Room A, 4th floor...' : '+1 (555) 019-2834...'}
                                                value={schedLocation}
                                                onChange={(e) => setSchedLocation(e.target.value)}
                                            />
                                        </div>
                                    )}

                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Interview Notes (Shared with Interviewer)</label>
                                        <textarea 
                                            className="form-control"
                                            rows="3"
                                            placeholder="Add agenda, special requirements, or preparation notes..."
                                            value={schedNotes}
                                            onChange={(e) => setSchedNotes(e.target.value)}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAppTab('pipeline')}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary btn-sm" disabled={isSavingInterview}>
                                            {editingInterview ? 'Reschedule' : 'Schedule'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {appTab === 'notes' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <h5 style={{ fontWeight: 600, marginBottom: 0 }}>Hiring Feedback & Recruiter Notes</h5>
                                    
                                    {/* Note entry form */}
                                    <form onSubmit={handleCreateNote} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <textarea 
                                                className="form-control"
                                                rows="3"
                                                placeholder="Add internal notes, interviewer feedback, or comments about this applicant..."
                                                value={newNoteContent}
                                                onChange={(e) => setNewNoteContent(e.target.value)}
                                                required
                                                style={{ fontSize: '0.85rem' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <button type="submit" className="btn btn-primary btn-sm" disabled={savingNote || !newNoteContent.trim()}>
                                                {savingNote ? 'Adding...' : 'Add Note'}
                                            </button>
                                        </div>
                                    </form>

                                    {/* Notes Feed list */}
                                    {loadingNotes ? (
                                        <div className="skeleton" style={{ height: '80px' }}></div>
                                    ) : notesList.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            No internal notes recorded yet. Be the first to add feedback!
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {notesList.map(note => {
                                                const isAuthor = user && (note.authorEmail === user.email || note.authorId === user.id);
                                                const isEditingThisNote = editingNoteId === note.id;

                                                return (
                                                    <div key={note.id} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', backgroundColor: 'var(--bg-card)' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                            <div>
                                                                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{note.authorName}</strong>
                                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({note.authorEmail})</span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                                    {new Date(note.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                                                                </span>
                                                                {isAuthor && !isEditingThisNote && (
                                                                    <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                                                                        <button 
                                                                            className="btn btn-ghost btn-sm"
                                                                            style={{ padding: '0 4px', height: '20px', fontSize: '0.7rem', color: 'var(--primary-color)' }}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setEditingNoteId(note.id);
                                                                                setEditingNoteContent(note.content);
                                                                            }}
                                                                        >
                                                                            Edit
                                                                        </button>
                                                                        <button 
                                                                            className="btn btn-ghost btn-sm"
                                                                            style={{ padding: '0 4px', height: '20px', fontSize: '0.7rem', color: 'var(--danger-color)' }}
                                                                            type="button"
                                                                            onClick={() => handleDeleteNote(note.id)}
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {isEditingThisNote ? (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                                <textarea 
                                                                    className="form-control"
                                                                    rows="3"
                                                                    value={editingNoteContent}
                                                                    onChange={(e) => setEditingNoteContent(e.target.value)}
                                                                    style={{ fontSize: '0.85rem' }}
                                                                />
                                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                                    <button 
                                                                        className="btn btn-secondary btn-sm" 
                                                                        style={{ height: '26px', fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setEditingNoteId(null);
                                                                            setEditingNoteContent('');
                                                                        }}
                                                                        disabled={savingNote}
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button 
                                                                        className="btn btn-primary btn-sm"
                                                                        style={{ height: '26px', fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                                                                        type="button"
                                                                        onClick={() => handleUpdateNote(note.id)}
                                                                        disabled={savingNote || !editingNoteContent.trim()}
                                                                    >
                                                                        Save
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                                                                {note.content}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {appTab === 'history' && (
                                <div>
                                    <h5 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Status Transition Logs</h5>
                                    {loadingTimeline ? (
                                        <div className="skeleton" style={{ height: '80px' }}></div>
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
                            )}
                        </div>
                        
                        <div className="card-footer" style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedApp(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Interview Confirmation Modal Overlay */}
            {cancellingInterviewId && (
                <div className="modal-backdrop" style={{ zIndex: 1200 }} onClick={() => setCancellingInterviewId(null)}>
                    <div className="modal-content" style={{ borderTop: '4px solid var(--danger-color)', maxWidth: '400px' }}>
                        <div className="card-header" style={{ padding: '1rem 1.25rem' }}>
                            <h4 className="card-title" style={{ fontSize: '1rem' }}>Cancel Interview</h4>
                            <button className="btn btn-ghost btn-sm" style={{ padding: 0, width: '24px', height: '24px' }} onClick={() => setCancellingInterviewId(null)}>✕</button>
                        </div>
                        <div className="card-body" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Are you sure you want to cancel this interview? This will update its status to CANCELLED and notify the candidate.</p>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Cancellation Reason (Optional)</label>
                                <textarea 
                                    className="form-control"
                                    rows="2"
                                    placeholder="Enter cancellation reason..."
                                    value={cancelNote}
                                    onChange={(e) => setCancelNote(e.target.value)}
                                    style={{ fontSize: '0.85rem' }}
                                />
                            </div>
                        </div>
                        <div className="card-footer" style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => setCancellingInterviewId(null)}>Close</button>
                            <button className="btn btn-danger btn-sm" onClick={handleCancelInterview}>Cancel Interview</button>
                        </div>
                    </div>
                </div>
            )}

            {selectedScreeningReport && (
                <ViewScreeningReportModal report={selectedScreeningReport} onClose={() => setSelectedScreeningReport(null)} />
            )}
        </div>
    );
};

export default Dashboard;

const ViewScreeningReportModal = ({ report, onClose }) => {
    const dialogRef = React.useRef(null);

    const getScoreColor = (score) => {
        if (score >= 80) return 'var(--success-color)';
        if (score >= 60) return 'var(--primary-color)';
        if (score >= 40) return 'var(--warning-color)';
        return 'var(--danger-color)';
    };

    const getRecommendationLabel = (rec) => {
        switch (rec) {
            case 'HIGHLY_RECOMMENDED': return 'Highly Recommended';
            case 'RECOMMENDED': return 'Recommended';
            case 'NEEDS_MANUAL_REVIEW': return 'Needs Manual Review';
            case 'LOW_MATCH': return 'Low Match';
            default: return rec;
        }
    };

    return (
        <div 
            className="modal-backdrop" 
            style={{ zIndex: 1200 }} 
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div 
                ref={dialogRef}
                className="modal-content" 
                role="dialog"
                aria-modal="true"
                style={{ borderTop: '4px solid var(--primary-color)', maxWidth: '850px', width: '90%' }}
            >
                <div className="card-header" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 className="card-title" style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                            <span>⚡ AI Screening Analysis</span>
                            <span className="badge" style={{
                                backgroundColor: report.recommendation === 'HIGHLY_RECOMMENDED' ? 'rgba(16, 185, 129, 0.15)' :
                                               report.recommendation === 'RECOMMENDED' ? 'rgba(79, 70, 229, 0.15)' :
                                               report.recommendation === 'NEEDS_MANUAL_REVIEW' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: report.recommendation === 'HIGHLY_RECOMMENDED' ? '#10b981' :
                                       report.recommendation === 'RECOMMENDED' ? '#4f46e5' :
                                       report.recommendation === 'NEEDS_MANUAL_REVIEW' ? '#f59e0b' : '#ef4444',
                                border: '1px solid currentColor',
                                fontSize: '0.75rem',
                                padding: '0.2rem 0.5rem'
                            }}>
                                {getRecommendationLabel(report.recommendation)}
                            </span>
                        </h3>
                        <p className="card-subtitle" style={{ fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                            Candidate: <strong>{report.candidateName}</strong> for <strong>{report.jobTitle}</strong>
                        </p>
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{ padding: 0, width: '28px', height: '28px' }} onClick={onClose}>✕</button>
                </div>

                <div className="card-body" style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Scores Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                        <div className="card" style={{ padding: '1rem', textAlign: 'center', border: '1.5px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: getScoreColor(report.overallScore) }}>
                                {report.overallScore}%
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.25rem', textTransform: 'uppercase' }}>Overall Match</div>
                        </div>

                        <div className="card" style={{ padding: '1rem', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: getScoreColor(report.experienceScore) }}>
                                {report.experienceScore}%
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.25rem', textTransform: 'uppercase' }}>Experience</div>
                        </div>

                        <div className="card" style={{ padding: '1rem', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: getScoreColor(report.educationScore) }}>
                                {report.educationScore}%
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.25rem', textTransform: 'uppercase' }}>Education</div>
                        </div>

                        <div className="card" style={{ padding: '1rem', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: getScoreColor(report.projectsScore) }}>
                                {report.projectsScore}%
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.25rem', textTransform: 'uppercase' }}>Projects</div>
                        </div>

                        <div className="card" style={{ padding: '1rem', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: getScoreColor(report.certificationsScore) }}>
                                {report.certificationsScore}%
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.25rem', textTransform: 'uppercase' }}>Certifications</div>
                        </div>
                    </div>

                    {/* Skills Breakdown */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        <div className="card" style={{ border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                            <div className="card-header" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <span>✔</span> Matched Skills
                                </h4>
                            </div>
                            <div className="card-body" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                {report.matchedSkills && report.matchedSkills.length > 0 ? (
                                    report.matchedSkills.map((skill, idx) => (
                                        <span key={idx} className="badge badge-success" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>{skill}</span>
                                    ))
                                ) : (
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None identified</span>
                                )}
                            </div>
                        </div>

                        <div className="card" style={{ border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                            <div className="card-header" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <span>✖</span> Missing / Gap Skills
                                </h4>
                            </div>
                            <div className="card-body" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                {report.missingSkills && report.missingSkills.length > 0 ? (
                                    report.missingSkills.map((skill, idx) => (
                                        <span key={idx} className="badge badge-danger" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>{skill}</span>
                                    ))
                                ) : (
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None identified</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Detailed Analysis (Strengths & Weaknesses) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        <div className="card" style={{ border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                            <div className="card-header" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--success-color)' }}>Candidate Strengths</h4>
                            </div>
                            <div className="card-body" style={{ padding: '1rem' }}>
                                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {report.strengths && report.strengths.length > 0 ? (
                                        report.strengths.map((str, idx) => <li key={idx}>{str}</li>)
                                    ) : (
                                        <li>No specific strengths highlighted</li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        <div className="card" style={{ border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                            <div className="card-header" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--warning-color)' }}>Areas for Improvement</h4>
                            </div>
                            <div className="card-body" style={{ padding: '1rem' }}>
                                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {report.weaknesses && report.weaknesses.length > 0 ? (
                                        report.weaknesses.map((weak, idx) => <li key={idx}>{weak}</li>)
                                    ) : (
                                        <li>No major gaps highlighted</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Footer info */}
                    <div style={{ 
                        borderTop: '1px solid var(--border-color)', 
                        paddingTop: '0.75rem', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        fontSize: '0.75rem', 
                        color: 'var(--text-muted)',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                    }}>
                        <span>Model: <strong>{report.modelName || 'Unknown'}</strong></span>
                        <span>Tokens: <strong>{report.totalTokens || 0}</strong> (Prompt: {report.promptTokens || 0}, Completion: {report.completionTokens || 0})</span>
                        <span>Estimated Cost: <strong>${(report.costEstimation || 0).toFixed(4)}</strong></span>
                        <span>Screened: <strong>{new Date(report.screenedAt).toLocaleString()}</strong></span>
                    </div>

                </div>

                <div className="card-footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary btn-sm" onClick={onClose}>Close Report</button>
                </div>
            </div>
        </div>
    );
};
