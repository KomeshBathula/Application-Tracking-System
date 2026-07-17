import React from 'react';

const JobCard = ({ job, onView, onEdit, onDelete, showActions, onApply, isApplied }) => {
    return (
        <div className="card">
            <div className="card-header" style={{ alignItems: 'flex-start' }}>
                <div>
                    <h3 className="card-title" style={{ fontSize: '1.15rem', fontWeight: '600' }}>{job.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <span style={{ fontWeight: 600 }}>{job.company}</span>
                        <span style={{ color: 'var(--text-muted)' }}>•</span>
                        <span>{job.location}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {isApplied && (
                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                            Applied
                        </span>
                    )}
                    {showActions && job.applicantCount !== undefined && job.applicantCount !== null && (
                        <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                            {job.applicantCount} {job.applicantCount === 1 ? 'applicant' : 'applicants'}
                        </span>
                    )}
                    <span className={`badge ${job.status === 'OPEN' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                        {job.status}
                    </span>
                </div>
            </div>
            
            <div className="card-body" style={{ padding: '1.25rem 1.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                    {job.description && job.description.length > 200 
                        ? `${job.description.substring(0, 200)}...` 
                        : job.description}
                </p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
                             <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                             <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                        </svg>
                        <span>{job.employmentType}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                            <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path>
                        </svg>
                        <span>{job.experienceRequired} Experience</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
                            <path d="M6 4h12M6 9h12M6 4a5 5 0 0 1 0 10h6L6 21"></path>
                        </svg>
                        <span>{job.salaryRange}</span>
                    </div>
                </div>
            </div>

            <div className="card-footer" style={{ backgroundColor: 'transparent', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)' }}>
                {showActions ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => onView(job)}>
                            View Details
                        </button>
                        {onEdit && (
                            <button className="btn btn-outline btn-sm" onClick={() => onEdit(job)}>
                                Edit
                            </button>
                        )}
                        {onDelete && (
                            <button className="btn btn-danger btn-sm" onClick={() => onDelete(job.id)}>
                                Delete
                            </button>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {onView && (
                            <button className="btn btn-secondary btn-sm" onClick={() => onView(job)}>
                                View Details
                            </button>
                        )}
                        {onApply && (
                            isApplied ? (
                                <button className="btn btn-secondary btn-sm" disabled style={{ opacity: 0.7, pointerEvents: 'none' }}>
                                    ✓ Applied
                                </button>
                            ) : (
                                <button className="btn btn-primary btn-sm" onClick={() => onApply(job)}>
                                    Apply
                                </button>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobCard;
