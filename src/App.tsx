
import React from 'react';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import ClerkAuth from './components/ClerkAuth';
import Dashboard from './components/Dashboard';
import { User } from './types/User';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

const App: React.FC = () => {
  const { user } = useUser();

  // Convertir usuario de Clerk al formato de User local
  const userData: User | null = user ? {
    id: user.id, // Usar el ID real de Clerk para Supabase
    username: user.username || user.emailAddresses[0]?.emailAddress || 'Usuario',
    password: '' // No necesario con Clerk
  } : null;

  const manejarLogout = () => {
    // Clerk maneja el logout automáticamente
    console.log('Logout manejado por Clerk');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-8">
        <SignedOut>
          <ClerkAuth />
        </SignedOut>
        
        <SignedIn>
          {userData && (
            <Dashboard user={userData} onLogout={manejarLogout} />
          )}
        </SignedIn>
      </div>
      <Toaster />
    </div>
  );
};

export default App;
