
import React, { useState } from 'react';
import { Filter, Download } from 'lucide-react';
import { Transaction } from '../../types/User';
import { useToast } from '@/hooks/use-toast';

interface PropiedadesHistorialTransacciones {
  transacciones: Transaction[];
}

const HistorialTransacciones: React.FC<PropiedadesHistorialTransacciones> = ({ transacciones }) => {
  const [opcionesFiltro, setOpcionesFiltro] = useState({
    tipo: 'Todos' as 'Todos' | 'Ingreso' | 'Gasto',
    busqueda: ''
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const { toast } = useToast();

  const aplicarFiltros = () => {
    return transacciones.filter(transaccion => {
      const coincideTipo = opcionesFiltro.tipo === 'Todos' || transaccion.type === opcionesFiltro.tipo;
      const coincideBusqueda = transaccion.description.toLowerCase().includes(opcionesFiltro.busqueda.toLowerCase());
      return coincideTipo && coincideBusqueda;
    });
  };

  const exportarACSV = () => {
    const datosFiltrados = aplicarFiltros();
    
    if (datosFiltrados.length === 0) {
      toast({
        title: "No hay datos",
        description: "No hay transacciones para exportar",
        variant: "destructive"
      });
      return;
    }

    const encabezados = ['Fecha', 'Descripción', 'Tipo', 'Cantidad'];
    const datosCSV = [
      encabezados.join(','),
      ...datosFiltrados.map(t => [
        new Date(t.date).toLocaleDateString('es-ES'),
        `"${t.description}"`,
        t.type,
        t.amount.toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([datosCSV], { type: 'text/csv;charset=utf-8;' });
    const enlace = document.createElement('a');
    const url = URL.createObjectURL(blob);
    enlace.setAttribute('href', url);
    enlace.setAttribute('download', `transacciones_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);

    toast({
      title: "¡Exportado!",
      description: "Archivo descargado correctamente"
    });
  };

  const actualizarFiltro = (campo: keyof typeof opcionesFiltro, valor: string) => {
    setOpcionesFiltro(prev => ({ ...prev, [campo]: valor }));
  };

  const transaccionesFiltradas = aplicarFiltros();

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-light text-gray-800">
          Historial <span className="text-lg text-gray-500">({transaccionesFiltradas.length})</span>
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
            onClick={exportarACSV}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium"
          >
            <Download className="w-4 h-4" />
            Exportar
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
                value={opcionesFiltro.tipo}
                onChange={(e) => actualizarFiltro('tipo', e.target.value as 'Todos' | 'Ingreso' | 'Gasto')}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                <option value="Todos">Todos</option>
                <option value="Ingreso">Ingresos</option>
                <option value="Gasto">Gastos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                value={opcionesFiltro.busqueda}
                onChange={(e) => actualizarFiltro('busqueda', e.target.value)}
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
              ? "Aún no hay transacciones. ¡Agrega la primera!"
              : "No hay transacciones que coincidan con los filtros."
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
  );
};

export default HistorialTransacciones;
