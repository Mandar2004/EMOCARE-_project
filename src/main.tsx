import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Dashboard } from './components/Dashboard'
import { TrendsPage } from './components/TrendsPage'
import { Questionnaire } from './components/Questionnaire'
import { ResourcesPage } from './components/ResourcesPage'
import { ChatPage } from './components/ChatPage'
import { AuthProvider } from './context/AuthContext'
import { AuthModalProvider } from './context/AuthModalContext'
import { AuthModal } from './components/auth/AuthModal'
import { ProtectedRoute } from './components/ProtectedRoute'
import { SignOutPage } from './components/auth/SignOutPage'
import { AccountPage } from './components/auth/AccountPage'
import './index.css'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthProvider>
            <AuthModalProvider>
                <BrowserRouter>
                    {/* Global auth modal */}
                    <AuthModal />

                    <Routes>
                        {/* Redirect old auth page URLs */}
                        <Route path="/signin" element={<Navigate to="/" replace />} />
                        <Route path="/signup" element={<Navigate to="/" replace />} />

                        {/* Public — anyone can explore the dashboard */}
                        <Route path="/" element={<Dashboard />} />

                        {/* Protected — require authentication (shows gate page if not signed in) */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/trends" element={<TrendsPage />} />
                            <Route path="/screening" element={<Questionnaire />} />
                            <Route path="/resources" element={<ResourcesPage />} />
                            <Route path="/chat" element={<ChatPage />} />
                            <Route path="/signout" element={<SignOutPage />} />
                            <Route path="/account" element={<AccountPage />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </AuthModalProvider>
        </AuthProvider>
    </StrictMode>,
)

