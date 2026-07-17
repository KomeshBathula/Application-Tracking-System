import React, { useState } from 'react';

const SearchBar = ({ onSearch, showStatusFilter = false }) => {
    const [title, setTitle] = useState('');
    const [company, setCompany] = useState('');
    const [location, setLocation] = useState('');
    const [employmentType, setEmploymentType] = useState('');
    const [status, setStatus] = useState('ALL');

    const handleClear = () => {
        setTitle('');
        setCompany('');
        setLocation('');
        setEmploymentType('');
        setStatus('ALL');
        onSearch({ title: '', company: '', location: '', employmentType: '', status: 'ALL' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch({ title, company, location, employmentType, status });
    };

    return (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-body" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Job Title</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="e.g. Developer, Designer..." 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                        />
                    </div>
                    
                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Company</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="e.g. TCS, Swiggy, Wipro..." 
                            value={company} 
                            onChange={(e) => setCompany(e.target.value)} 
                        />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Location</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="e.g. Bengaluru, Remote, Mumbai..." 
                            value={location} 
                            onChange={(e) => setLocation(e.target.value)} 
                        />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Employment Type</label>
                        <select 
                            className="form-control" 
                            style={{
                                borderRadius: '6px',
                                backgroundColor: 'var(--bg-input)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-color)',
                                padding: '0.5rem 1.75rem 0.5rem 0.875rem',
                                cursor: 'pointer',
                                outline: 'none',
                                appearance: 'none',
                                WebkitAppearance: 'none',
                                MozAppearance: 'none',
                                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 0.65rem center',
                                backgroundSize: '0.9em',
                                transition: 'all 0.15s ease'
                            }}
                            value={employmentType} 
                            onChange={(e) => setEmploymentType(e.target.value)}
                        >
                            <option value="">All Types</option>
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Internship">Internship</option>
                        </select>
                    </div>

                    {showStatusFilter && (
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</label>
                            <select 
                                className="form-control" 
                                style={{
                                    borderRadius: '6px',
                                    backgroundColor: 'var(--bg-input)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-color)',
                                    padding: '0.5rem 1.75rem 0.5rem 0.875rem',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    appearance: 'none',
                                    WebkitAppearance: 'none',
                                    MozAppearance: 'none',
                                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 0.65rem center',
                                    backgroundSize: '0.9em',
                                    transition: 'all 0.15s ease'
                                }}
                                value={status} 
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="OPEN">Open</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleClear}>Clear Filters</button>
                    <button type="submit" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <span>Search</span>
                    </button>
                </div>
            </div>
        </form>
    );
};

export default SearchBar;
