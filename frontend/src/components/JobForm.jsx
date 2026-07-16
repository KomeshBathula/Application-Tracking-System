import React, { useState, useEffect } from 'react';

const JobForm = ({ initialData, onSubmit, onCancel, titleText }) => {
    const [title, setTitle] = useState('');
    const [company, setCompany] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [employmentType, setEmploymentType] = useState('Full-time');
    const [experienceRequired, setExperienceRequired] = useState('');
    const [salaryRange, setSalaryRange] = useState('');
    const [status, setStatus] = useState('OPEN');
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || '');
            setCompany(initialData.company || '');
            setLocation(initialData.location || '');
            setDescription(initialData.description || '');
            setEmploymentType(initialData.employmentType || 'Full-time');
            setExperienceRequired(initialData.experienceRequired || '');
            setSalaryRange(initialData.salaryRange || '');
            setStatus(initialData.status || 'OPEN');
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !company.trim() || !location.trim() || !description.trim() || !experienceRequired.trim() || !salaryRange.trim()) {
            setError('All fields are required.');
            return;
        }
        setError('');
        onSubmit({
            title,
            company,
            location,
            description,
            employmentType,
            experienceRequired,
            salaryRange,
            status
        });
    };

    return (
        <div className="card" style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div className="card-header">
                <h3 className="card-title" style={{ fontSize: '1.15rem' }}>{titleText}</h3>
            </div>
            
            <div className="card-body">
                {error && <div className="alert alert-danger">⚠ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label form-label-required">Job Title</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="e.g. Senior Staff Frontend Engineer" 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)} 
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label form-label-required">Company Name</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="e.g. Stripe, Inc." 
                                value={company} 
                                onChange={(e) => setCompany(e.target.value)} 
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label form-label-required">Location</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="e.g. San Francisco, CA (Hybrid)" 
                                value={location} 
                                onChange={(e) => setLocation(e.target.value)} 
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label form-label-required">Employment Type</label>
                            <select 
                                className="form-control" 
                                value={employmentType} 
                                onChange={(e) => setEmploymentType(e.target.value)}
                            >
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                                <option value="Internship">Internship</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label form-label-required">Experience Required</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="e.g. 5+ years" 
                                value={experienceRequired} 
                                onChange={(e) => setExperienceRequired(e.target.value)} 
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label form-label-required">Salary Range</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="e.g. $140k - $180k" 
                                value={salaryRange} 
                                onChange={(e) => setSalaryRange(e.target.value)} 
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label form-label-required">Job Status</label>
                            <select 
                                className="form-control" 
                                value={status} 
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="OPEN">Open</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label form-label-required">Job Description</label>
                            <textarea 
                                className="form-control" 
                                rows="8" 
                                placeholder="Explain the role, requirements, benefits, and expectations..." 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)} 
                                style={{ resize: 'vertical' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>Cancel</button>
                        <button type="submit" className="btn btn-primary btn-sm">Save Job Posting</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JobForm;
