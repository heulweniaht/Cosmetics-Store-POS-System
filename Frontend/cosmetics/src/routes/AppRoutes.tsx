
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';

import { AuthLayout } from '../layouts/AuthLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { UserLayout } from '../layouts/UserLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';


// Auth components
import { Login } from '../features/auth/Login';
import { Register } from '../features/auth/Register';

// Admin routes
import { AdminRoutes } from './adminRoutes';

// User routes
import { UserRoutes } from './userRoutes';

export const AppRoutes = () => {
    const {  isAuthenticated, isAdmin, isUser } = useAuth();


    return (
        <BrowserRouter>
            <Routes>
                {/* Auth Routes */}
                <Route path="/auth" element={<AuthLayout />}>
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                </Route>

                {/* Admin Routes */}
                <Route
                    path="/admin/*"
                    element={
                        <ProtectedRoute>
                            {isAdmin() ? (
                                <AdminLayout>
                                    <AdminRoutes />
                                </AdminLayout>
                            ) : (
                                <Navigate to="/user/home" replace />
                            )}
                        </ProtectedRoute>
                    }
                />

                {/* User Routes */}
                <Route
                    path="/user/*"
                    element={
                        <ProtectedRoute>
                            {isUser() && !isAdmin() ? (
                                <UserLayout>
                                    <UserRoutes />
                                </UserLayout>
                            ) : isAdmin() ? (
                                <Navigate to="/admin/dashboard" replace />
                            ) : (
                                <Navigate to="/auth/login" replace />
                            )}
                        </ProtectedRoute>
                    }
                />

                {/* Root Route - Redirect based on role */}
                <Route
                    path="/"
                    element={
                        isAuthenticated ? (
                            isAdmin() ? (
                                <Navigate to="/admin/dashboard" replace />
                            ) : (
                                <Navigate to="/user/home" replace />
                            )
                        ) : (
                            <Navigate to="/auth/login" replace />
                        )
                    }
                />

                {/* Catch all route */}
                <Route
                    path="*"
                    element={
                        isAuthenticated ? (
                            isAdmin() ? (
                                <Navigate to="/admin/dashboard" replace />
                            ) : (
                                <Navigate to="/user/home" replace />
                            )
                        ) : (
                            <Navigate to="/auth/login" replace />
                        )
                    }
                />
            </Routes>
        </BrowserRouter>
    );
};