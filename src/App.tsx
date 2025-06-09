
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import FormularioAuth from './components/auth/FormularioAuth';
import Tablero from './components/Tablero';
import { User as UsuarioLocal } from './types/User';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

const App: React.FC = () => {
  const [usuarioActual, setUsuarioActual] = useState<User | null>(null);
  const [sesionUsuario, setSesionUsuario] = useState<Session | null>(null);
  const [estaInicializando, setEstaInicializando] = useState(true);

  useEffect(() => {
    // Configurar listener del estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (evento, sesion) => {
        console.log('Estado de auth cambió:', evento, sesion);
        setSesionUsuario(sesion);
        setUsuarioActual(sesion?.user ?? null);
        setEstaInicializando(false);
      }
    );

    // Verificar sesión existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesionUsuario(session);
      setUsuarioActual(session?.user ?? null);
      setEstaInicializando(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Transformar usuario de Supabase a formato local
  const usuarioTransformado: UsuarioLocal | null = usuarioActual ? {
    id: usuarioActual.id,
    username: usuarioActual.email?.split('@')[0] || 'Usuario',
    password: '' // No necesario con Supabase
  } : null;

  const manejarCierreSesionUsuario = async () => {
    console.log('Cerrando sesión de usuario...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (estaInicializando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-teal-500 rounded-full flex items-center justify-center mb-6 shadow-lg animate-pulse mx-auto">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <h2 className="text-2xl font-light text-gray-800 mb-2">Cargando...</h2>
          <p className="text-gray-600 font-light">Iniciando FinBit</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-8">
        {!sesionUsuario ? (
          <FormularioAuth />
        ) : (
          usuarioTransformado && (
            <Tablero usuario={usuarioTransformado} alCerrarSesion={manejarCierreSesionUsuario} />
          )
        )}
      </div>
      <Toaster />
    </div>
  );
};

export default App;
