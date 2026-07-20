import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import CandidateLogin from './pages/candidate/Login';
import CandidateRegister from './pages/candidate/Register';
import CandidateDashboard from './pages/candidate/Dashboard';
import RecruiterLogin from './pages/recruiter/Login';
import RecruiterRegister from './pages/recruiter/Register';
import RecruiterDashboard from './pages/recruiter/Dashboard';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import Unauthorized from './pages/Unauthorized';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
            <Router>
                <Routes>
                    {/* General Landing Portal Selector */}
                    <Route path="/" element={<Landing />} />

                    {/* Candidate Portal Routes */}
                    <Route path="/login" element={<Navigate to="/candidate/login" replace />} />
                    <Route path="/register" element={<Navigate to="/candidate/register" replace />} />
                    <Route path="/candidate/login" element={<CandidateLogin />} />
                    <Route path="/candidate/register" element={<CandidateRegister />} />
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

                    {/* Recruiter Portal Routes */}
                    <Route path="/recruiter/login" element={<RecruiterLogin />} />
                    <Route path="/recruiter/register" element={<RecruiterRegister />} />
                    <Route 
                        path="/recruiter/dashboard" 
                        element={
                            <ProtectedRoute allowedRoles={['RECRUITER']}>
                                <RecruiterDashboard />
                            </ProtectedRoute>
                        } 
                    />
                    <Route path="/recruiter/jobs" element={<ProtectedRoute allowedRoles={['RECRUITER']}><RecruiterDashboard section="jobs" /></ProtectedRoute>} />
                    <Route path="/recruiter/candidates" element={<ProtectedRoute allowedRoles={['RECRUITER']}><RecruiterDashboard section="candidates" /></ProtectedRoute>} />
                    <Route path="/recruiter/interviews" element={<ProtectedRoute allowedRoles={['RECRUITER']}><RecruiterDashboard section="interviews" /></ProtectedRoute>} />
                    <Route path="/recruiter/profile" element={<ProtectedRoute allowedRoles={['RECRUITER']}><RecruiterDashboard section="profile" /></ProtectedRoute>} />
                    <Route path="/recruiter/ai-config" element={<ProtectedRoute allowedRoles={['COMPANY_ADMIN', 'ADMIN']}><RecruiterDashboard section="ai-config" /></ProtectedRoute>} />

                    {/* Admin Portal Routes (Only accessible by direct link) */}
                    <Route path="/admin/login" element={<AdminLogin />} />
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

                    {/* Catch all redirect to Landing */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
