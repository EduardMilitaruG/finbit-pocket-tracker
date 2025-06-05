
import React, { useState, useEffect } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';
import Dashboard from '../components/Dashboard';
import { User } from '../types/User';

const Inicio = () => {
  const [usuarioActual, setUsuarioActual] = useState<User | null>(null);
  const [vistaActual, setVistaActual] = useState<'login' | 'register' | 'dashboard'>('login');

  useEffect(() => {
    const usuarioLogueado = sessionStorage.getItem('usuarioActual');
    if (usuarioLogueado) {
      setUsuarioActual(JSON.parse(usuarioLogueado));
      setVistaActual('dashboard');
    }
  }, []);

  const manejarLogin = (usuario: User) => {
    setUsuarioActual(usuario);
    setVistaActual('dashboard');
    sessionStorage.setItem('usuarioActual', JSON.stringify(usuario));
  };

  const manejarLogout = () => {
    setUsuarioActual(null);
    setVistaActual('login');
    sessionStorage.removeItem('usuarioActual');
  };

  const cambiarARegistro = () => setVistaActual('register');
  const cambiarALogin = () => setVistaActual('login');

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
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-light text-white mb-2 drop-shadow-lg">
            <span className="font-extralight">Fin</span>
            <span className="font-normal">Bit</span>
          </h1>
          <p className="text-white/90 text-lg font-light drop-shadow-md">Gestión Personal de Finanzas - PFC MVP</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {vistaActual === 'login' && (
            <Login 
              onLogin={manejarLogin} 
              onSwitchToRegister={cambiarARegistro}
            />
          )}
          
          {vistaActual === 'register' && (
            <Register 
              onRegister={manejarLogin}
              onSwitchToLogin={cambiarALogin}
            />
          )}
          
          {vistaActual === 'dashboard' && usuarioActual && (
            <Dashboard 
              user={usuarioActual}
              onLogout={manejarLogout}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Inicio;
