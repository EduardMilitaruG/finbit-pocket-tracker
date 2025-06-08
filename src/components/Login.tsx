
import React, { useState } from 'react';
import { supabaseService } from '../services/SupabaseService';
import { User } from '../types/User';
import { LogIn, User as UserIcon, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoginProps {
  onLogin: (usuario: User) => void;
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const { toast } = useToast();

  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      await supabaseService.signIn(email, password);
      const user = await supabaseService.getCurrentUser();
      
      if (user) {
        toast({
          title: "¡Bienvenido!",
          description: "Inicio de sesión exitoso"
        });
        onLogin(user);
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      toast({
        title: "Error",
        description: error.message || "Usuario o contraseña incorrectos",
        variant: "destructive"
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-400 to-teal-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <LogIn className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-light text-gray-800 mb-2">Iniciar Sesión</h2>
        <p className="text-gray-600 font-light">Accede a tu cuenta</p>
      </div>

      <form onSubmit={manejarLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/80 backdrop-blur-sm font-light text-lg transition-all duration-200"
              placeholder="tu@email.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/80 backdrop-blur-sm font-light text-lg transition-all duration-200"
            placeholder="Ingresa tu contraseña"
            required
          />
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white py-4 px-6 rounded-2xl hover:from-blue-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 font-light">
          ¿No tienes cuenta?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:underline"
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
