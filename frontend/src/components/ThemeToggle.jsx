import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { isDark, toggleTheme } = useContext(ThemeContext);

    return (
        <button 
            onClick={toggleTheme} 
            className="btn btn-secondary btn-sm"
            style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                cursor: 'pointer',
                border: '1px solid var(--border-color)' 
            }}
            title="Toggle Theme"
        >
            {isDark ? '☀️ Light' : '🌙 Dark'}
        </button>
    );
};

export default ThemeToggle;
