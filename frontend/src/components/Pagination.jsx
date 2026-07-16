import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem' }}>
            <button 
                className="btn btn-secondary btn-sm" 
                disabled={currentPage === 0} 
                onClick={() => onPageChange(currentPage - 1)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                <span>Previous</span>
            </button>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Page <strong style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{currentPage + 1}</strong> of <strong style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{totalPages}</strong>
            </span>
            <button 
                className="btn btn-secondary btn-sm" 
                disabled={currentPage >= totalPages - 1} 
                onClick={() => onPageChange(currentPage + 1)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            >
                <span>Next</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>
        </div>
    );
};

export default Pagination;
