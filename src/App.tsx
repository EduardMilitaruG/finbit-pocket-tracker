
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { supabaseService } from './services/SupabaseService';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import { User } from './types/User';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

const App: React.FC = () => {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [vistaActual, setVistaActual] = useState<'login' | 'register'>('login');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Configurar listener de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (session?.user) {
          // Usuario logueado
          const user = await supabaseService.getCurrentUser();
          setUsuario(user);
        } else {
          // Usuario no logueado
          setUsuario(null);
        }
        setCargando(false);
      }
    );

    // Verificar sesión existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabaseService.getCurrentUser().then(setUsuario);
      }
      setCargando(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const manejarLogin = (datosUsuario: User) => {
    setUsuario(datosUsuario);
  };

  const manejarLogout = async () => {
    try {
      await supabaseService.signOut();
      setUsuario(null);
      setVistaActual('login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const cambiarARegistro = () => {
    setVistaActual('register');
  };

  const cambiarALogin = () => {
    setVistaActual('login');
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-teal-500 rounded-full flex items-center justify-center mb-4 shadow-lg animate-pulse mx-auto">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-light text-gray-800 mb-2">Cargando...</h2>
          <p className="text-gray-600 font-light">Verificando autenticación</p>
        </div>
      </div>
    );
  }

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
