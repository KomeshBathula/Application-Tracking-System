import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "403 Forbidden - ATS";
    }, []);

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', padding: '2rem' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%', borderTop: '4px solid var(--danger-color)', textAlign: 'center' }}>
                <div className="card-body" style={{ padding: '3rem 2rem' }}>
                    <h1 style={{ color: 'var(--danger-color)', fontSize: '3.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.05em' }}>403</h1>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Access Denied</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                        You do not have the required permissions to view this resource.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
                            Go Back
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate('/')}>
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
