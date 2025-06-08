import React, { useState, useEffect } from 'react';
import { supabaseService } from '../services/SupabaseService';
import { User, Transaction } from '../types/User';
import { LogOut, Plus, TrendingUp, TrendingDown, DollarSign, Target, User as UserIcon, BarChart3, CreditCard, Filter, Download } from 'lucide-react';
import SavingsGoals from './SavingsGoals';
import Profile from './Profile';
import Markets from './Markets';
import ConexionBancaria from './ConexionBancaria';
import { useToast } from '@/hooks/use-toast';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [transacciones, setTransacciones] = useState<Transaction[]>([]);
  const [descripcion, setDescripcion] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [tipo, setTipo] = useState<'Ingreso' | 'Gasto'>('Ingreso');
  const [cargando, setCargando] = useState(false);
  const [pestanaActiva, setPestanaActiva] = useState<'transacciones' | 'ahorros' | 'mercados' | 'perfil' | 'banco'>('transacciones');
  
  // Estados para filtros
  const [filtroTipo, setFiltroTipo] = useState<'Todos' | 'Ingreso' | 'Gasto'>('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    cargarTransacciones();
  }, [user.id]);

  const cargarTransacciones = async () => {
    try {
      const transaccionesUsuario = await supabaseService.getTransactions(user.id);
      setTransacciones(transaccionesUsuario);
    } catch (error) {
      console.error('Error cargando transacciones:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las transacciones",
        variant: "destructive"
      });
    }
  };

  const validarFormulario = () => {
    if (!descripcion.trim()) {
      toast({
        title: "Error de validación",
        description: "La descripción es obligatoria",
        variant: "destructive"
      });
      return false;
    }

    const cantidadNum = parseFloat(cantidad);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      toast({
        title: "Error de validación",
        description: "La cantidad debe ser un número positivo",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const manejarAgregarTransaccion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setCargando(true);

    try {
      await supabaseService.addTransaction(descripcion, parseFloat(cantidad), tipo);
      toast({
        title: "¡Éxito!",
        description: "Transacción agregada correctamente"
      });
      setDescripcion('');
      setCantidad('');
      setTipo('Ingreso');
      await cargarTransacciones();
    } catch (error) {
      console.error('Error agregando transacción:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar la transacción",
        variant: "destructive"
      });
    } finally {
      setCargando(false);
    }
  };

  const exportarCSV = () => {
    const transaccionesFiltradas = filtrarTransacciones();
    
    if (transaccionesFiltradas.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay transacciones para exportar",
        variant: "destructive"
      });
      return;
    }

    const headers = ['Fecha', 'Descripción', 'Tipo', 'Cantidad'];
    const csvContent = [
      headers.join(','),
      ...transaccionesFiltradas.map(t => [
        new Date(t.date).toLocaleDateString('es-ES'),
        `"${t.description}"`,
        t.type,
        t.amount.toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transacciones_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "¡Exportado!",
      description: "Archivo CSV descargado correctamente"
    });
  };

  const filtrarTransacciones = () => {
    return transacciones.filter(transaccion => {
      const cumpleTipo = filtroTipo === 'Todos' || transaccion.type === filtroTipo;
      const cumpleBusqueda = transaccion.description.toLowerCase().includes(busqueda.toLowerCase());
      return cumpleTipo && cumpleBusqueda;
    });
  };

  const calcularBalance = () => {
    return transacciones.reduce((balance, transaccion) => {
      return transaccion.type === 'Ingreso' 
        ? balance + transaccion.amount 
        : balance - transaccion.amount;
    }, 0);
  };

  const obtenerTotalIngresos = () => {
    return transacciones
      .filter(t => t.type === 'Ingreso')
      .reduce((total, t) => total + t.amount, 0);
  };

  const obtenerTotalGastos = () => {
    return transacciones
      .filter(t => t.type === 'Gasto')
      .reduce((total, t) => total + t.amount, 0);
  };

  const balance = calcularBalance();
  const totalIngresos = obtenerTotalIngresos();
  const totalGastos = obtenerTotalGastos();
  const transaccionesFiltradas = filtrarTransacciones();

  return (
    <div className="space-y-6">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-light text-gray-800 mb-2">
              Bienvenido, <span className="font-medium">{user.username}</span>
            </h2>
            <p className="text-gray-600 font-light text-lg">Panel de Control Financiero</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-2xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-light mb-1">Saldo Total</p>
              <p className={`text-3xl font-light ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                €{balance.toFixed(2)}
              </p>
            </div>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
              balance >= 0 ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-red-400 to-pink-500'
            }`}>
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-light mb-1">Total Ingresos</p>
              <p className="text-3xl font-light text-green-600">€{totalIngresos.toFixed(2)}</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-light mb-1">Total Gastos</p>
              <p className="text-3xl font-light text-red-600">€{totalGastos.toFixed(2)}</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <TrendingDown className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="flex">
          <button
            onClick={() => setPestanaActiva('transacciones')}
            className={`flex-1 py-4 px-6 font-medium transition-all duration-200 ${
              pestanaActiva === 'transacciones'
                ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white'
                : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              Transacciones
            </div>
          </button>
          <button
            onClick={() => setPestanaActiva('ahorros')}
            className={`flex-1 py-4 px-6 font-medium transition-all duration-200 ${
              pestanaActiva === 'ahorros'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Target className="w-5 h-5" />
              Objetivos de Ahorro
            </div>
          </button>
          <button
            onClick={() => setPestanaActiva('banco')}
            className={`flex-1 py-4 px-6 font-medium transition-all duration-200 ${
              pestanaActiva === 'banco'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <CreditCard className="w-5 h-5" />
              Conectar Banco
            </div>
          </button>
          <button
            onClick={() => setPestanaActiva('mercados')}
            className={`flex-1 py-4 px-6 font-medium transition-all duration-200 ${
              pestanaActiva === 'mercados'
                ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white'
                : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Mercados
            </div>
          </button>
          <button
            onClick={() => setPestanaActiva('perfil')}
            className={`flex-1 py-4 px-6 font-medium transition-all duration-200 ${
              pestanaActiva === 'perfil'
                ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <UserIcon className="w-5 h-5" />
              Perfil
            </div>
          </button>
        </div>
      </div>

      {pestanaActiva === 'transacciones' ? (
        <>
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-light text-gray-800 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-teal-500 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              Agregar Transacción
            </h3>
            
            <form onSubmit={manejarAgregarTransaccion} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80 backdrop-blur-sm font-light text-lg transition-all duration-200"
                    placeholder="Ej: Salario, Compra supermercado..."
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
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
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
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as 'Ingreso' | 'Gasto')}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80 backdrop-blur-sm font-light text-lg transition-all duration-200"
                  >
                    <option value="Ingreso">Ingreso</option>
                    <option value="Gasto">Gasto</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-teal-500 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-teal-600 transition-all duration-200 disabled:opacity-50 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {cargando ? 'Agregando...' : 'Agregar Transacción'}
              </button>
            </form>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-light text-gray-800">
                Historial de Transacciones <span className="text-lg text-gray-500">({transaccionesFiltradas.length})</span>
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setMostrarFiltros(!mostrarFiltros)}
                  className="flex items-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-medium"
                >
                  <Filter className="w-4 h-4" />
                  Filtros
                </button>
                <button
                  onClick={exportarCSV}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium"
                >
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </button>
              </div>
            </div>

            {mostrarFiltros && (
              <div className="mb-6 p-4 bg-gray-50/50 rounded-2xl border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filtrar por tipo
                    </label>
                    <select
                      value={filtroTipo}
                      onChange={(e) => setFiltroTipo(e.target.value as 'Todos' | 'Ingreso' | 'Gasto')}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    >
                      <option value="Todos">Todos</option>
                      <option value="Ingreso">Ingresos</option>
                      <option value="Gasto">Gastos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Buscar por descripción
                    </label>
                    <input
                      type="text"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                      placeholder="Buscar transacciones..."
                    />
                  </div>
                </div>
              </div>
            )}
            
            {transaccionesFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg font-light">
                  {transacciones.length === 0 
                    ? "No hay transacciones registradas. ¡Agrega tu primera transacción!"
                    : "No se encontraron transacciones con los filtros aplicados."
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-4 font-medium text-gray-700">Fecha</th>
                      <th className="text-left py-4 px-4 font-medium text-gray-700">Descripción</th>
                      <th className="text-left py-4 px-4 font-medium text-gray-700">Tipo</th>
                      <th className="text-right py-4 px-4 font-medium text-gray-700">Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transaccionesFiltradas
                      .sort((a, b) => b.date - a.date)
                      .map((transaccion) => (
                        <tr key={transaccion.id} className="border-b border-gray-100 hover:bg-white/50 transition-colors duration-200">
                          <td className="py-4 px-4 text-sm text-gray-600 font-light">
                            {new Date(transaccion.date).toLocaleDateString('es-ES')}
                          </td>
                          <td className="py-4 px-4 text-sm font-light">{transaccion.description}</td>
                          <td className="py-4 px-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              transaccion.type === 'Ingreso' 
                                ? 'bg-green-100/80 text-green-700 border border-green-200' 
                                : 'bg-red-100/80 text-red-700 border border-red-200'
                            }`}>
                              {transaccion.type}
                            </span>
                          </td>
                          <td className={`py-4 px-4 text-sm text-right font-medium ${
                            transaccion.type === 'Ingreso' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaccion.type === 'Ingreso' ? '+' : '-'}€{transaccion.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : pestanaActiva === 'ahorros' ? (
        <SavingsGoals userId={user.id} />
      ) : pestanaActiva === 'banco' ? (
        <ConexionBancaria userId={user.id} onTransaccionesImportadas={cargarTransacciones} />
      ) : pestanaActiva === 'mercados' ? (
        <Markets />
      ) : (
        <Profile user={user} onLogout={onLogout} />
      )}
    </div>
  );
};

export default Dashboard;
