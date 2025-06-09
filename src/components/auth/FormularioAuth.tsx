
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LogIn, UserPlus, User as IconoUsuario, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FormularioAuth: React.FC = () => {
  const [modoActual, setModoActual] = useState(true); // true para login, false para registro
  const [credenciales, setCredenciales] = useState({
    email: '',
    password: '',
    nombreUsuario: ''
  });
  const [procesando, setProcesando] = useState(false);
  const [contrasenaVisible, setContrasenaVisible] = useState(false);
  const { toast } = useToast();

  const procesarInicioSesion = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcesando(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: credenciales.email,
        password: credenciales.password
      });

      if (error) {
        const mensajeAmigable = error.message === 'Invalid login credentials' 
          ? 'Email o contraseña incorrectos' 
          : error.message;
        
        toast({
          title: "No se pudo iniciar sesión",
          description: mensajeAmigable,
          variant: "destructive"
        });
      } else {
        toast({
          title: "¡Perfecto!",
          description: "Sesión iniciada correctamente"
        });
      }
    } catch (error) {
      console.error('Intento de inicio de sesión falló:', error);
      toast({
        title: "Error",
        description: "Algo salió mal al intentar iniciar sesión",
        variant: "destructive"
      });
    } finally {
      setProcesando(false);
    }
  };

  const procesarRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcesando(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: credenciales.email,
        password: credenciales.password,
        options: {
          data: {
            username: credenciales.nombreUsuario || credenciales.email.split('@')[0]
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast({
          title: "Error en el registro",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "¡Cuenta creada!",
          description: "Revisa tu bandeja de entrada para confirmar tu cuenta"
        });
      }
    } catch (error) {
      console.error('Registro falló:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la cuenta",
        variant: "destructive"
      });
    } finally {
      setProcesando(false);
    }
  };

  const actualizarCampo = (campo: string, valor: string) => {
    setCredenciales(prev => ({ ...prev, [campo]: valor }));
  };

  const alternarVisibilidadContrasena = () => {
    setContrasenaVisible(!contrasenaVisible);
  };

  const cambiarModo = () => {
    setModoActual(!modoActual);
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Encabezado de la App */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-light text-white mb-2 drop-shadow-lg">
          <span className="font-extralight">Fin</span>
          <span className="font-normal">Bit</span>
        </h1>
        <p className="text-white/90 text-lg font-light drop-shadow-md">
          Tu Gestor Financiero Personal
        </p>
      </div>

      {/* Formulario Principal */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-400 to-teal-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
            {modoActual ? (
              <LogIn className="w-8 h-8 text-white" />
            ) : (
              <UserPlus className="w-8 h-8 text-white" />
            )}
          </div>
          <h2 className="text-3xl font-light text-gray-800 mb-2">
            {modoActual ? 'Accede a tu cuenta' : 'Crea tu cuenta'}
          </h2>
          <p className="text-gray-600 font-light">
            {modoActual ? 'Inicia sesión para continuar' : 'Únete a FinBit hoy'}
          </p>
        </div>

        <form onSubmit={modoActual ? procesarInicioSesion : procesarRegistro} className="space-y-6">
          {!modoActual && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de usuario (opcional)
              </label>
              <div className="relative">
                <IconoUsuario className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={credenciales.nombreUsuario}
                  onChange={(e) => actualizarCampo('nombreUsuario', e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/80 backdrop-blur-sm font-light text-lg transition-all duration-200"
                  placeholder="Como quieres que te llamemos"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              value={credenciales.email}
              onChange={(e) => actualizarCampo('email', e.target.value)}
              className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/80 backdrop-blur-sm font-light text-lg transition-all duration-200"
              placeholder="tu@correo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={contrasenaVisible ? "text" : "password"}
                value={credenciales.password}
                onChange={(e) => actualizarCampo('password', e.target.value)}
                className="w-full px-4 py-4 pr-12 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/80 backdrop-blur-sm font-light text-lg transition-all duration-200"
                placeholder="Tu contraseña segura"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={alternarVisibilidadContrasena}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {contrasenaVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={procesando}
            className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white py-4 px-6 rounded-2xl hover:from-blue-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {procesando 
              ? (modoActual ? 'Iniciando sesión...' : 'Creando cuenta...') 
              : (modoActual ? 'Iniciar Sesión' : 'Crear Cuenta')
            }
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 font-light">
            {modoActual ? '¿Aún no tienes cuenta?' : '¿Ya tienes una cuenta?'}{' '}
            <button
              onClick={cambiarModo}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:underline"
            >
              {modoActual ? 'Créala aquí' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FormularioAuth;
