
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
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url('/lovable-uploads/38c5741a-b15a-4fdc-9613-a1c6dbe8397d.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-light text-white mb-2 drop-shadow-lg">
            <span className="font-extralight">Fin</span>
            <span className="font-normal">Bit</span>
          </h1>
          <p className="text-white/90 text-lg font-light drop-shadow-md">Gestión Personal de Finanzas - PFC MVP</p>
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
