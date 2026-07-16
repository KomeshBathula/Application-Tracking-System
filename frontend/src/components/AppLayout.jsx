import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const AppLayout = ({ children, activeTab, setActiveTab, navigationItems, roleTitle, roleColor }) => {
    const { user, logout } = useContext(AuthContext);
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="app-container">
            {/* Sidebar */}
            <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <div className="sidebar-brand-icon">▲</div>
                        {!collapsed && <span>ATS Portal</span>}
                    </div>
                    <button 
                        className="btn btn-ghost btn-sm" 
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ padding: 0, width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {collapsed ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        )}
                    </button>
                </div>
                <div className="sidebar-nav">
                    {!collapsed && <div className="sidebar-group-title">Console</div>}
                    {navigationItems.map((item) => (
                        <button
                            key={item.id}
                            className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                            title={collapsed ? item.label : ""}
                        >
                            <span className="sidebar-item-icon">{item.icon}</span>
                            {!collapsed && <span>{item.label}</span>}
                        </button>
                    ))}
                    
                    <button
                        className="sidebar-item"
                        onClick={logout}
                        style={{ marginTop: 'auto', color: 'var(--danger-color)' }}
                        title={collapsed ? "Sign Out" : ""}
                    >
                        <span className="sidebar-item-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                        </span>
                        {!collapsed && <span>Sign Out</span>}
                    </button>
                </div>
                <div className="sidebar-footer">
                    <div className="sidebar-profile">
                        <div className="avatar">
                            {(user?.fullName?.charAt(0) || 'U').toUpperCase()}
                        </div>
                        {!collapsed && (
                            <div className="sidebar-profile-info">
                                <span className="sidebar-profile-name">{user?.fullName}</span>
                                <span className="sidebar-profile-role">{roleTitle}</span>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Wrapper */}
            <div className="main-wrapper">
                {/* Topbar */}
                <header className="topbar">
                    <div className="topbar-left">
                        <div className="breadcrumb">
                            <span>Portal</span>
                            <span className="breadcrumb-separator">/</span>
                            <span className="breadcrumb-current">
                                {navigationItems.find(n => n.id === activeTab)?.label || 'Dashboard'}
                            </span>
                        </div>
                    </div>
                    <div className="topbar-right">
                        <ThemeToggle />
                        <span className="badge" style={{ 
                            backgroundColor: roleColor?.startsWith('var(') ? roleColor.replace('color)', 'light)') : (roleColor ? roleColor + '1a' : undefined), 
                            color: roleColor, 
                            border: roleColor ? `1px solid color-mix(in srgb, ${roleColor} 20%, transparent)` : undefined 
                        }}>
                            {roleTitle}
                        </span>
                    </div>
                </header>

                {/* Content Area */}
                <main className="content-area">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
