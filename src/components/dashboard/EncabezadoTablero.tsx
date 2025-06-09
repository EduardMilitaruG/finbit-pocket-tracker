
import React from 'react';
import { LogOut } from 'lucide-react';
import { User } from '../../types/User';

interface PropiedadesEncabezadoTablero {
  usuario: User;
  alCerrarSesion: () => void;
}

const EncabezadoTablero: React.FC<PropiedadesEncabezadoTablero> = ({ usuario, alCerrarSesion }) => {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-light text-gray-800 mb-2">
            Hola, <span className="font-medium">{usuario.username}</span>
          </h2>
          <p className="text-gray-600 font-light text-lg">Tu Centro de Control Financiero</p>
        </div>
        <button
          onClick={alCerrarSesion}
          className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-2xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <LogOut className="w-5 h-5" />
          Salir
        </button>
      </div>
    </div>
  );
};

export default EncabezadoTablero;
