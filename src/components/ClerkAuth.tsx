
import React from 'react';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';
import { LogIn, UserPlus } from 'lucide-react';

const ClerkAuth: React.FC = () => {
  return (
    <div className="max-w-md mx-auto bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
      <SignedOut>
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-400 to-teal-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-light text-gray-800 mb-2">Bienvenido a FinBit</h2>
          <p className="text-gray-600 font-light">Gestión Personal de Finanzas</p>
        </div>

        <div className="space-y-4">
          <SignInButton fallbackRedirectUrl="/dashboard">
            <button className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white py-4 px-6 rounded-2xl hover:from-blue-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
              <LogIn className="w-5 h-5" />
              Iniciar Sesión
            </button>
          </SignInButton>

          <SignUpButton fallbackRedirectUrl="/dashboard">
            <button className="w-full bg-gradient-to-r from-teal-500 to-green-500 text-white py-4 px-6 rounded-2xl hover:from-teal-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
              <UserPlus className="w-5 h-5" />
              Registrarse
            </button>
          </SignUpButton>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 font-light">
            Autenticación segura con Clerk
          </p>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <UserButton />
          </div>
          <h2 className="text-2xl font-light text-gray-800 mb-2">¡Bienvenido!</h2>
          <p className="text-gray-600 font-light">Autenticado correctamente</p>
        </div>
      </SignedIn>
    </div>
  );
};

export default ClerkAuth;
