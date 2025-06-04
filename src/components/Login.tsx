
import React, { useState } from 'react';
import { indexedDBService } from '../services/IndexedDBService';
import { User } from '../types/User';
import { LogIn, User as UserIcon } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToRegister }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const userData = await indexedDBService.getUser(user, pass);
      if (userData) {
        setMsg('¡Login exitoso!');
        onLogin(userData);
      } else {
        setMsg('Usuario o contraseña incorrectos');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMsg('Error al iniciar sesión');
    } finally {
      setLoading(false);
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

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Usuario
          </label>
          <div className="relative">
            <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/80 backdrop-blur-sm font-light text-lg transition-all duration-200"
              placeholder="Ingresa tu usuario"
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
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/80 backdrop-blur-sm font-light text-lg transition-all duration-200"
            placeholder="Ingresa tu contraseña"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white py-4 px-6 rounded-2xl hover:from-blue-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>

      {msg && (
        <div className={`mt-6 p-4 rounded-2xl text-sm font-medium ${
          msg.includes('exitoso') 
            ? 'bg-green-100/80 text-green-700 border border-green-200' 
            : 'bg-red-100/80 text-red-700 border border-red-200'
        }`}>
          {msg}
        </div>
      )}

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
