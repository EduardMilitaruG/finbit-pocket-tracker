
import React from 'react';
import { Plus, Target, CreditCard, BarChart3, User as IconoUsuario } from 'lucide-react';

type OpcionPestana = 'transacciones' | 'ahorros' | 'banco' | 'mercados' | 'perfil';

interface PropiedadesPestanasNavegacion {
  pestanaActiva: OpcionPestana;
  alCambiarPestana: (pestana: OpcionPestana) => void;
}

const PestanasNavegacion: React.FC<PropiedadesPestanasNavegacion> = ({ pestanaActiva, alCambiarPestana }) => {
  const configuracionesPestanas = [
    {
      id: 'transacciones' as OpcionPestana,
      etiqueta: 'Transacciones',
      icono: Plus,
      gradiente: 'from-blue-500 to-teal-500'
    },
    {
      id: 'ahorros' as OpcionPestana,
      etiqueta: 'Objetivos de Ahorro',
      icono: Target,
      gradiente: 'from-purple-500 to-pink-500'
    },
    {
      id: 'banco' as OpcionPestana,
      etiqueta: 'Conectar Banco',
      icono: CreditCard,
      gradiente: 'from-green-500 to-emerald-500'
    },
    {
      id: 'mercados' as OpcionPestana,
      etiqueta: 'Mercados',
      icono: BarChart3,
      gradiente: 'from-orange-500 to-yellow-500'
    },
    {
      id: 'perfil' as OpcionPestana,
      etiqueta: 'Perfil',
      icono: IconoUsuario,
      gradiente: 'from-gray-500 to-gray-600'
    }
  ];

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
      <div className="flex">
        {configuracionesPestanas.map((pestana) => {
          const esPestanaActual = pestanaActiva === pestana.id;
          const Icono = pestana.icono;
          
          return (
            <button
              key={pestana.id}
              onClick={() => alCambiarPestana(pestana.id)}
              className={`flex-1 py-4 px-6 font-medium transition-all duration-200 ${
                esPestanaActual
                  ? `bg-gradient-to-r ${pestana.gradiente} text-white`
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Icono className="w-5 h-5" />
                {pestana.etiqueta}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PestanasNavegacion;
