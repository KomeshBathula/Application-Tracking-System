import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import api from '../services/api';

const formatTimeAgo = (dateString) => {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
        return '';
    }
};

const getNotificationIcon = (type) => {
    switch (type) {
        case 'APPLICATION_SUBMITTED':
            return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            );
        case 'APPLICATION_STATUS_UPDATED':
            return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            );
        case 'INTERVIEW_SCHEDULED':
            return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
            );
        default:
            return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
            );
    }
};

const AppLayout = ({ children, activeTab, setActiveTab, navigationItems, roleTitle, roleColor }) => {
    const { user, logout } = useContext(AuthContext);
    const [collapsed, setCollapsed] = useState(false);
    
    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [panelOpen, setPanelOpen] = useState(false);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [notificationsError, setNotificationsError] = useState(false);
    const dropdownRef = useRef(null);

    const fetchUnreadCount = async () => {
        try {
            const res = await api.get('/notifications/unread-count');
            if (res.data && res.data.success) {
                setUnreadCount(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    };

    const fetchNotifications = async () => {
        setLoadingNotifications(true);
        setNotificationsError(false);
        try {
            const res = await api.get('/notifications', { params: { page: 0, size: 10 } });
            if (res.data && res.data.success && res.data.data.content) {
                setNotifications(res.data.data.content);
            } else {
                setNotificationsError(true);
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setNotificationsError(true);
        } finally {
            setLoadingNotifications(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            
            // Poll for unread notifications count every 30 seconds
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setPanelOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const togglePanel = () => {
        if (!panelOpen) {
            fetchNotifications();
            fetchUnreadCount();
        }
        setPanelOpen(!panelOpen);
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.readStatus) {
            try {
                await api.patch(`/notifications/${notification.id}/read`);
                setUnreadCount(prev => Math.max(0, prev - 1));
                setNotifications(prev => 
                    prev.map(n => n.id === notification.id ? { ...n, readStatus: true } : n)
                );
            } catch (err) {
                console.error('Error marking notification as read:', err);
            }
        }
        setPanelOpen(false);
        if (notification.navigationUrl) {
            window.location.href = notification.navigationUrl;
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

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
                        
                        {/* Notification Bell */}
                        <div className="notification-container" ref={dropdownRef}>
                            <button className="notification-bell-btn" onClick={togglePanel} title="Notifications">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="notification-badge">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {panelOpen && (
                                <div className="notification-dropdown">
                                    <div className="notification-dropdown-header">
                                        <span className="notification-dropdown-title">Notifications</span>
                                        {unreadCount > 0 && (
                                            <button className="notification-dropdown-action" onClick={handleMarkAllAsRead}>
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>
                                    <div className="notification-list">
                                        {loadingNotifications ? (
                                            <div className="notification-empty">
                                                <span className="notification-empty-icon">⏳</span>
                                                <span>Loading notifications...</span>
                                            </div>
                                        ) : notificationsError ? (
                                            <div className="notification-empty">
                                                <span className="notification-empty-icon">⚠️</span>
                                                <span>Failed to load notifications.</span>
                                            </div>
                                        ) : notifications.length === 0 ? (
                                            <div className="notification-empty">
                                                <span className="notification-empty-icon">🔔</span>
                                                <span>You're all caught up!</span>
                                            </div>
                                        ) : (
                                            notifications.map(n => (
                                                <button 
                                                    key={n.id} 
                                                    className={`notification-item ${!n.readStatus ? 'unread' : ''}`}
                                                    onClick={() => handleNotificationClick(n)}
                                                >
                                                    <div className="notification-item-icon">
                                                        {getNotificationIcon(n.notificationType)}
                                                    </div>
                                                    <div className="notification-item-content">
                                                        <div className="notification-item-title">{n.title}</div>
                                                        <div className="notification-item-message">{n.message}</div>
                                                        <div className="notification-item-time">{formatTimeAgo(n.createdAt)}</div>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

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
