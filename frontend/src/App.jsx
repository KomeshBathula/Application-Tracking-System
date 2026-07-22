import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Register from './pages/candidate/Register';
import SuperAdminLogin from './pages/admin/SuperAdminLogin';
import CompanyAdminLogin from './pages/admin/CompanyAdminLogin';
import CandidateDashboard from './pages/candidate/Dashboard';
import RecruiterDashboard from './pages/recruiter/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import Unauthorized from './pages/Unauthorized';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <Routes>
                        {/* Default route redirects to /home */}
                        <Route path="/" element={<Navigate to="/home" replace />} />
                        <Route path="/home" element={<Home />} />

                        {/* Candidate Registration Page */}
                        <Route path="/register" element={<Register />} />
                        <Route path="/candidate/register" element={<Register />} />

                        {/* Secured Admin Logins */}
                        <Route path="/super-admin/login" element={<SuperAdminLogin />} />
                        <Route path="/company-admin/login" element={<CompanyAdminLogin />} />

                        {/* Legacy & Shortcut Route Aliases */}
                        <Route path="/login" element={<Navigate to="/home" replace />} />
                        <Route path="/candidate/login" element={<Navigate to="/home" replace />} />
                        <Route path="/admin/login" element={<Navigate to="/super-admin/login" replace />} />
                        <Route path="/recruiter/login" element={<Navigate to="/company-admin/login" replace />} />
                        <Route path="/recruiter/register" element={<Navigate to="/register" replace />} />

                        {/* Candidate Protected Dashboard Routes */}
                        <Route 
                            path="/candidate/dashboard" 
                            element={
                                <ProtectedRoute allowedRoles={['CANDIDATE']}>
                                    <CandidateDashboard />
                                </ProtectedRoute>
                            } 
                        />
                        <Route path="/candidate/jobs" element={<ProtectedRoute allowedRoles={['CANDIDATE']}><CandidateDashboard section="jobs" /></ProtectedRoute>} />
                        <Route path="/candidate/applications" element={<ProtectedRoute allowedRoles={['CANDIDATE']}><CandidateDashboard section="applications" /></ProtectedRoute>} />
                        <Route path="/candidate/interviews" element={<ProtectedRoute allowedRoles={['CANDIDATE']}><CandidateDashboard section="interviews" /></ProtectedRoute>} />
                        <Route path="/candidate/profile" element={<ProtectedRoute allowedRoles={['CANDIDATE']}><CandidateDashboard section="profile" /></ProtectedRoute>} />

                        {/* Recruiter / Company Admin Protected Dashboard Routes */}
                        <Route 
                            path="/recruiter/dashboard" 
                            element={
                                <ProtectedRoute allowedRoles={['RECRUITER', 'COMPANY_ADMIN', 'ADMIN']}>
                                    <RecruiterDashboard />
                                </ProtectedRoute>
                            } 
                        />
                        <Route path="/recruiter/jobs" element={<ProtectedRoute allowedRoles={['RECRUITER', 'COMPANY_ADMIN', 'ADMIN']}><RecruiterDashboard section="jobs" /></ProtectedRoute>} />
                        <Route path="/recruiter/candidates" element={<ProtectedRoute allowedRoles={['RECRUITER', 'COMPANY_ADMIN', 'ADMIN']}><RecruiterDashboard section="candidates" /></ProtectedRoute>} />
                        <Route path="/recruiter/interviews" element={<ProtectedRoute allowedRoles={['RECRUITER', 'COMPANY_ADMIN', 'ADMIN']}><RecruiterDashboard section="interviews" /></ProtectedRoute>} />
                        <Route path="/recruiter/profile" element={<ProtectedRoute allowedRoles={['RECRUITER', 'COMPANY_ADMIN', 'ADMIN']}><RecruiterDashboard section="profile" /></ProtectedRoute>} />
                        <Route path="/recruiter/ai-config" element={<ProtectedRoute allowedRoles={['COMPANY_ADMIN', 'ADMIN']}><RecruiterDashboard section="ai-config" /></ProtectedRoute>} />

                        {/* Super Admin Protected Dashboard Routes */}
                        <Route 
                            path="/admin/dashboard" 
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            } 
                        />
                        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard section="users" /></ProtectedRoute>} />
                        <Route path="/admin/roles" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard section="roles" /></ProtectedRoute>} />
                        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard section="settings" /></ProtectedRoute>} />

                        {/* Security & Error Handlers */}
                        <Route path="/unauthorized" element={<Unauthorized />} />

                        {/* Catch all redirect to /home */}
                        <Route path="*" element={<Navigate to="/home" replace />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
