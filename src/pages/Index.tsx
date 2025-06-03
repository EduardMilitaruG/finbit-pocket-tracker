
import React, { useState, useEffect } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';
import Dashboard from '../components/Dashboard';
import { User } from '../types/User';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'dashboard'>('login');

  useEffect(() => {
    // Check if user is already logged in (simple session check)
    const loggedInUser = sessionStorage.getItem('currentUser');
    if (loggedInUser) {
      setCurrentUser(JSON.parse(loggedInUser));
      setCurrentView('dashboard');
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
    sessionStorage.removeItem('currentUser');
  };

  const switchToRegister = () => setCurrentView('register');
  const switchToLogin = () => setCurrentView('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            <span className="text-blue-600">Fin</span>
            <span className="text-green-600">Bit</span>
          </h1>
          <p className="text-gray-600">Gestión Personal de Finanzas - PFC MVP</p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {currentView === 'login' && (
            <Login 
              onLogin={handleLogin} 
              onSwitchToRegister={switchToRegister}
            />
          )}
          
          {currentView === 'register' && (
            <Register 
              onRegister={handleLogin}
              onSwitchToLogin={switchToLogin}
            />
          )}
          
          {currentView === 'dashboard' && currentUser && (
            <Dashboard 
              user={currentUser}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
