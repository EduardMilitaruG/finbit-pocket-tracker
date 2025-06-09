
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PropiedadesTarjetaEstadistica {
  titulo: string;
  cantidad: number;
  icono: LucideIcon;
  esquemaColor: 'positivo' | 'negativo' | 'neutral';
}

const TarjetaEstadistica: React.FC<PropiedadesTarjetaEstadistica> = ({ titulo, cantidad, icono: Icono, esquemaColor }) => {
  const obtenerClasesColor = () => {
    switch (esquemaColor) {
      case 'positivo':
        return {
          texto: 'text-green-600',
          fondo: 'bg-gradient-to-br from-green-400 to-emerald-500'
        };
      case 'negativo':
        return {
          texto: 'text-red-600',
          fondo: 'bg-gradient-to-br from-red-400 to-pink-500'
        };
      default:
        return {
          texto: cantidad >= 0 ? 'text-green-600' : 'text-red-600',
          fondo: cantidad >= 0 ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-red-400 to-pink-500'
        };
    }
  };

  const colores = obtenerClasesColor();

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-light mb-1">{titulo}</p>
          <p className={`text-3xl font-light ${colores.texto}`}>
            €{Math.abs(cantidad).toFixed(2)}
          </p>
        </div>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${colores.fondo}`}>
          <Icono className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );
};

export default TarjetaEstadistica;
