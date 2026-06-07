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
                    <Route path="/login" element={<CandidateLogin />} />
                    <Route path="/register" element={<CandidateRegister />} />
                    <Route 
                        path="/candidate/dashboard" 
                        element={
                            <ProtectedRoute allowedRoles={['CANDIDATE']}>
                                <CandidateDashboard />
                            </ProtectedRoute>
                        } 
                    />

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
