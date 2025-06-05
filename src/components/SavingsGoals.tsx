
import React, { useState, useEffect } from 'react';
import { indexedDBService } from '../services/IndexedDBService';
import { SavingsGoal } from '../types/User';
import { Target, Plus, TrendingUp, Calendar } from 'lucide-react';

interface SavingsGoalsProps {
  userId: number;
}

const ObjetivosAhorro: React.FC<SavingsGoalsProps> = ({ userId }) => {
  const [objetivos, setObjetivos] = useState<SavingsGoal[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [cantidadObjetivo, setCantidadObjetivo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaLimite, setFechaLimite] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarObjetivos();
  }, [userId]);

  const cargarObjetivos = async () => {
    try {
      const objetivosUsuario = await indexedDBService.obtenerObjetivosAhorroPorUsuario(userId);
      setObjetivos(objetivosUsuario);
    } catch (error) {
      console.error('Error cargando objetivos de ahorro:', error);
    }
  };

  const manejarAgregarObjetivo = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setMensaje('');

    try {
      const fechaLimiteTimestamp = fechaLimite ? new Date(fechaLimite).getTime() : undefined;
      await indexedDBService.agregarObjetivoAhorro(
        userId,
        titulo,
        parseFloat(cantidadObjetivo),
        descripcion || undefined,
        fechaLimiteTimestamp
      );
      
      setMensaje('¡Objetivo de ahorro creado exitosamente!');
      setTitulo('');
      setCantidadObjetivo('');
      setDescripcion('');
      setFechaLimite('');
      setMostrarFormulario(false);
      await cargarObjetivos();
    } catch (error) {
      console.error('Error agregando objetivo de ahorro:', error);
      setMensaje('Error al crear objetivo de ahorro');
    } finally {
      setCargando(false);
    }
  };

  const manejarActualizarCantidad = async (idObjetivo: number, cantidadActual: number, incremento: number) => {
    try {
      const nuevaCantidad = Math.max(0, cantidadActual + incremento);
      await indexedDBService.actualizarCantidadObjetivoAhorro(idObjetivo, nuevaCantidad);
      await cargarObjetivos();
    } catch (error) {
      console.error('Error actualizando objetivo de ahorro:', error);
    }
  };

  const obtenerPorcentajeProgreso = (actual: number, objetivo: number) => {
    return Math.min((actual / objetivo) * 100, 100);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-light text-gray-800 mb-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              Objetivos de Ahorro
            </h3>
            <p className="text-gray-600 font-light">Establece metas y sigue tu progreso</p>
          </div>
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Nuevo Objetivo
          </button>
        </div>
      </div>

      {mostrarFormulario && (
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <h4 className="text-xl font-light text-gray-800 mb-6">Crear Nuevo Objetivo</h4>
          
          <form onSubmit={manejarAgregarObjetivo} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título del Objetivo
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/80 backdrop-blur-sm font-light text-lg transition-all duration-200"
                  placeholder="Ej: Vacaciones de verano"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad Objetivo (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cantidadObjetivo}
                  onChange={(e) => setCantidadObjetivo(e.target.value)}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/80 backdrop-blur-sm font-light text-lg transition-all duration-200"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción (Opcional)
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/80 backdrop-blur-sm font-light text-lg transition-all duration-200 resize-none"
                placeholder="Describe tu objetivo..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Límite (Opcional)
              </label>
              <input
                type="date"
                value={fechaLimite}
                onChange={(e) => setFechaLimite(e.target.value)}
                className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/80 backdrop-blur-sm font-light text-lg transition-all duration-200"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={cargando}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {cargando ? 'Creando...' : 'Crear Objetivo'}
              </button>
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className="bg-gray-200 text-gray-700 px-8 py-4 rounded-2xl hover:bg-gray-300 transition-all duration-200 font-medium text-lg"
              >
                Cancelar
              </button>
            </div>
          </form>

          {mensaje && (
            <div className={`mt-6 p-4 rounded-2xl text-sm font-medium ${
              mensaje.includes('exitosamente') 
                ? 'bg-green-100/80 text-green-700 border border-green-200' 
                : 'bg-red-100/80 text-red-700 border border-red-200'
            }`}>
              {mensaje}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {objetivos.length === 0 ? (
          <div className="col-span-full bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12 border border-white/20 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-light">
              No tienes objetivos de ahorro. ¡Crea tu primer objetivo!
            </p>
          </div>
        ) : (
          objetivos.map((objetivo) => {
            const progreso = obtenerPorcentajeProgreso(objetivo.currentAmount, objetivo.targetAmount);
            const completado = progreso >= 100;
            
            return (
              <div key={objetivo.id} className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/20">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h5 className="text-lg font-medium text-gray-800 mb-1">{objetivo.title}</h5>
                    {objetivo.description && (
                      <p className="text-sm text-gray-600 font-light">{objetivo.description}</p>
                    )}
                  </div>
                  {completado && (
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>€{objetivo.currentAmount.toFixed(2)}</span>
                    <span>€{objetivo.targetAmount.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        completado 
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                          : 'bg-gradient-to-r from-purple-400 to-pink-500'
                      }`}
                      style={{ width: `${progreso}%` }}
                    />
                  </div>
                  <div className="text-center mt-2">
                    <span className={`text-sm font-medium ${
                      completado ? 'text-green-600' : 'text-purple-600'
                    }`}>
                      {progreso.toFixed(1)}% completado
                    </span>
                  </div>
                </div>

                {objetivo.deadline && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>Hasta: {new Date(objetivo.deadline).toLocaleDateString('es-ES')}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => manejarActualizarCantidad(objetivo.id, objetivo.currentAmount, 10)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 px-4 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 text-sm font-medium"
                  >
                    +€10
                  </button>
                  <button
                    onClick={() => manejarActualizarCantidad(objetivo.id, objetivo.currentAmount, 50)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white py-2 px-4 rounded-xl hover:from-blue-600 hover:to-teal-600 transition-all duration-200 text-sm font-medium"
                  >
                    +€50
                  </button>
                  <button
                    onClick={() => manejarActualizarCantidad(objetivo.id, objetivo.currentAmount, -10)}
                    disabled={objetivo.currentAmount <= 0}
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-2 px-4 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 text-sm font-medium disabled:opacity-50"
                  >
                    -€10
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ObjetivosAhorro;
