
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import AuthForm from './components/auth/AuthForm';
import Dashboard from './components/Dashboard';
import { User as LocalUser } from './types/User';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userSession, setUserSession] = useState<Session | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Set up authentication state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setUserSession(session);
        setCurrentUser(session?.user ?? null);
        setIsInitializing(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserSession(session);
      setCurrentUser(session?.user ?? null);
      setIsInitializing(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Transform Supabase user to local format
  const transformedUser: LocalUser | null = currentUser ? {
    id: currentUser.id,
    username: currentUser.email?.split('@')[0] || 'Usuario',
    password: '' // Not needed with Supabase
  } : null;

  const handleUserLogout = async () => {
    console.log('Logging out user...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    }
  };

  if (isInitializing) {
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
        {!userSession ? (
          <AuthForm />
        ) : (
          transformedUser && (
            <Dashboard user={transformedUser} onLogout={handleUserLogout} />
          )
        )}
      </div>
      <Toaster />
    </div>
  );
};

export default App;
