
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import FormularioAuth from './components/auth/FormularioAuth';
import Tablero from './components/Tablero';
import { User as TipoUsuario } from './types/User';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

const App: React.FC = () => {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [sesion, setSesion] = useState<Session | null>(null);
  const [cargandoInicial, setCargandoInicial] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (evento, nuevaSesion) => {
        setSesion(nuevaSesion);
        setUsuario(nuevaSesion?.user ?? null);
        setCargandoInicial(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session);
      setUsuario(session?.user ?? null);
      setCargandoInicial(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const usuarioLocal: TipoUsuario | null = usuario ? {
    id: usuario.id,
    username: usuario.email?.split('@')[0] || 'Usuario',
    password: ''
  } : null;

  const cerrarSesion = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logout:', error);
    }
  };

  if (cargandoInicial) {
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
        {!sesion ? (
          <FormularioAuth />
        ) : (
          usuarioLocal && (
            <Tablero usuario={usuarioLocal} alCerrarSesion={cerrarSesion} />
          )
        )}
      </div>
      <Toaster />
    </div>
  );
};

export default App;
