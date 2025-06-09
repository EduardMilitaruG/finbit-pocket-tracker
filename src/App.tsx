
import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import { User } from './types/User';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

const App: React.FC = () => {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [vistaActual, setVistaActual] = useState<'login' | 'register'>('login');

  const manejarLogin = (datosUsuario: User) => {
    setUsuario(datosUsuario);
  };

  const manejarLogout = () => {
    setUsuario(null);
    setVistaActual('login');
  };

  const cambiarARegistro = () => {
    setVistaActual('register');
  };

  const cambiarALogin = () => {
    setVistaActual('login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-8">
        {usuario ? (
          <Dashboard user={usuario} onLogout={manejarLogout} />
        ) : vistaActual === 'login' ? (
          <Login onLogin={manejarLogin} onSwitchToRegister={cambiarARegistro} />
        ) : (
          <Register onRegister={manejarLogin} onSwitchToLogin={cambiarALogin} />
        )}
      </div>
      <Toaster />
    </div>
  );
};

export default App;
