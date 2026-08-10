import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import api from './api';

// PAGES
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ParentPortal from './pages/ParentPortal';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      setUser({ role: res.data.role, ...res.data.user });
    } catch (e) {
      console.error("Auth check failed", e);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (loginData) => {
    setUser({ role: loginData.role, ...loginData.user });
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950 font-black text-white text-3xl tracking-tighter italic animate-pulse">
        CARREGANDO ARENA...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="h-screen w-full bg-slate-950 font-sans overflow-hidden text-slate-100">
        <main className="h-full w-full overflow-y-auto">
          <Routes>
            <Route 
              path="/" 
              element={
                user 
                  ? (user.role === 'responsavel' ? <Navigate to="/portal" /> : <Navigate to="/admin" />) 
                  : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/login" 
              element={
                user 
                  ? (user.role === 'responsavel' ? <Navigate to="/portal" /> : <Navigate to="/admin" />) 
                  : <LoginPage onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/admin" 
              element={
                user && user.role !== 'responsavel' 
                  ? <AdminDashboard user={user} logout={handleLogout} /> 
                  : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/portal" 
              element={
                user && user.role === 'responsavel' 
                  ? <ParentPortal user={user} logout={handleLogout} /> 
                  : <Navigate to="/login" />
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            body { margin: 0; padding: 0; overflow: hidden; height: 100vh; background-color: #020617; }
            *::-webkit-scrollbar { width: 4px; display: none; }
            @media (min-width: 1024px) { *::-webkit-scrollbar { display: block; } }
            *::-webkit-scrollbar-track { background: transparent; }
            *::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
          `
        }} />
      </div>
    </BrowserRouter>
  );
}

export default App;
