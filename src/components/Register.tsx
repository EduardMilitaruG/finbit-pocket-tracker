
import React, { useState } from 'react';
import { supabaseService } from '../services/SupabaseService';
import { User } from '../types/User';
import { UserPlus, User as UserIcon, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RegisterProps {
  onRegister: (usuario: User) => void;
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const { toast } = useToast();

  const manejarRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    if (password !== confirmarPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive"
      });
      setCargando(false);
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive"
      });
      setCargando(false);
      return;
    }

    try {
      await supabaseService.signUp(email, password, username);
      
      toast({
        title: "¡Registro exitoso!",
        description: "Revisa tu email para confirmar tu cuenta"
      });
      
      // Después del registro exitoso, intentar login automático
      setTimeout(async () => {
        try {
          await supabaseService.signIn(email, password);
          const user = await supabaseService.getCurrentUser();
          if (user) {
            onRegister(user);
          }
        } catch (error) {
          // Si falla el login automático, redirigir a login
          onSwitchToLogin();
        }
      }, 1000);
      
    } catch (error: any) {
      console.error('Error en registro:', error);
      toast({
        title: "Error",
        description: error.message || "Error al registrar usuario",
        variant: "destructive"
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-teal-400 to-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <UserPlus className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-light text-gray-800 mb-2">Registrarse</h2>
        <p className="text-gray-600 font-light">Crea tu cuenta</p>
      </div>

      <form onSubmit={manejarRegistro} className="space-y-6">
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
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white/80 backdrop-blur-sm font-light text-lg transition-all duration-200"
              placeholder="tu@email.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de Usuario
          </label>
          <div className="relative">
            <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white/80 backdrop-blur-sm font-light text-lg transition-all duration-200"
              placeholder="Elige un nombre de usuario"
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
            className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white/80 backdrop-blur-sm font-light text-lg transition-all duration-200"
            placeholder="Mínimo 6 caracteres"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirmar Contraseña
          </label>
          <input
            type="password"
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white/80 backdrop-blur-sm font-light text-lg transition-all duration-200"
            placeholder="Confirma tu contraseña"
            required
          />
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-gradient-to-r from-teal-500 to-green-500 text-white py-4 px-6 rounded-2xl hover:from-teal-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {cargando ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 font-light">
          ¿Ya tienes cuenta?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-teal-600 hover:text-teal-700 font-medium transition-colors duration-200 hover:underline"
          >
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
