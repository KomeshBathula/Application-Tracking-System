import React from 'react';
import JobCard from './JobCard';

const JobList = ({ jobs, onView, onEdit, onDelete, showActions }) => {
    if (!jobs || jobs.length === 0) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: '4rem 2rem', 
                border: '1px dashed var(--border-color)', 
                borderRadius: '12px', 
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                margin: '1.5rem 0'
            }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>No job listings found</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>There are no job postings matching your search criteria. Try modifying your filters.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {jobs.map((job) => (
                <JobCard 
                    key={job.id} 
                    job={job} 
                    onView={onView} 
                    onEdit={onEdit} 
                    onDelete={onDelete} 
                    showActions={showActions} 
                />
            ))}
        </div>
    );
};

export default JobList;
