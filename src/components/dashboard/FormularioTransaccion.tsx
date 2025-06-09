
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { servicioSupabase } from '../../services/SupabaseService';
import { SavingsGoal } from '../../types/User';

interface PropiedadesFormularioTransaccion {
  alEnviar: (descripcion: string, cantidad: number, tipo: 'Ingreso' | 'Gasto', objetivoAhorroId?: string) => Promise<void>;
  estaCargando: boolean;
  userId: string;
}

const FormularioTransaccion: React.FC<PropiedadesFormularioTransaccion> = ({ alEnviar, estaCargando, userId }) => {
  const [datosFormulario, setDatosFormulario] = useState({
    descripcion: '',
    cantidad: '',
    tipo: 'Ingreso' as 'Ingreso' | 'Gasto',
    objetivoAhorroId: ''
  });
  const [objetivosAhorro, setObjetivosAhorro] = useState<SavingsGoal[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    cargarObjetivosAhorro();
  }, [userId]);

  const cargarObjetivosAhorro = async () => {
    try {
      const objetivos = await servicioSupabase.obtenerObjetivosAhorroPorUsuario(userId);
      setObjetivosAhorro(objetivos);
    } catch (error) {
      console.error('Error cargando objetivos de ahorro:', error);
    }
  };

  const validarEntrada = () => {
    if (!datosFormulario.descripcion.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor, agrega una descripción",
        variant: "destructive"
      });
      return false;
    }

    const cantidadAnalizada = parseFloat(datosFormulario.cantidad);
    if (isNaN(cantidadAnalizada) || cantidadAnalizada <= 0) {
      toast({
        title: "Cantidad inválida",
        description: "La cantidad debe ser un número mayor que cero",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const manejarEnvioFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarEntrada()) return;

    try {
      await alEnviar(
        datosFormulario.descripcion, 
        parseFloat(datosFormulario.cantidad), 
        datosFormulario.tipo,
        datosFormulario.objetivoAhorroId || undefined
      );
      
      // Reiniciar formulario después del envío exitoso
      setDatosFormulario({
        descripcion: '',
        cantidad: '',
        tipo: 'Ingreso',
        objetivoAhorroId: ''
      });
    } catch (error) {
      // El manejo de errores se hace en el componente padre
    }
  };

  const actualizarCampoFormulario = (campo: keyof typeof datosFormulario, valor: string) => {
    setDatosFormulario(prev => ({ ...prev, [campo]: valor }));
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
      <h3 className="text-2xl font-light text-gray-800 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-teal-500 rounded-full flex items-center justify-center">
          <Plus className="w-6 h-6 text-white" />
        </div>
        Nueva Transacción
      </h3>
      
      <form onSubmit={manejarEnvioFormulario} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <input
              type="text"
              value={datosFormulario.descripcion}
              onChange={(e) => actualizarCampoFormulario('descripcion', e.target.value)}
              className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80 backdrop-blur-sm font-light text-lg transition-all duration-200"
              placeholder="Ej: Supermercado, Salario..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad (€)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={datosFormulario.cantidad}
              onChange={(e) => actualizarCampoFormulario('cantidad', e.target.value)}
              className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80 backdrop-blur-sm font-light text-lg transition-all duration-200"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <select
              value={datosFormulario.tipo}
              onChange={(e) => actualizarCampoFormulario('tipo', e.target.value as 'Ingreso' | 'Gasto')}
              className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80 backdrop-blur-sm font-light text-lg transition-all duration-200"
            >
              <option value="Ingreso">Ingreso</option>
              <option value="Gasto">Gasto</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objetivo de Ahorro (Opcional)
            </label>
            <select
              value={datosFormulario.objetivoAhorroId}
              onChange={(e) => actualizarCampoFormulario('objetivoAhorroId', e.target.value)}
              className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80 backdrop-blur-sm font-light text-lg transition-all duration-200"
            >
              <option value="">Sin vincular</option>
              {objetivosAhorro.map((objetivo) => (
                <option key={objetivo.id} value={objetivo.id}>
                  {objetivo.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={estaCargando}
          className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-teal-500 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-teal-600 transition-all duration-200 disabled:opacity-50 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {estaCargando ? 'Guardando...' : 'Agregar Transacción'}
        </button>
      </form>
    </div>
  );
};

export default FormularioTransaccion;
