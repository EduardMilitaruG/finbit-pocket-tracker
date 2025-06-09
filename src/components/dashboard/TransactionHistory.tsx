
import React, { useState } from 'react';
import { Filter, Download } from 'lucide-react';
import { Transaction } from '../../types/User';
import { useToast } from '@/hooks/use-toast';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const [filterOptions, setFilterOptions] = useState({
    type: 'Todos' as 'Todos' | 'Ingreso' | 'Gasto',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const applyFilters = () => {
    return transactions.filter(transaction => {
      const matchesType = filterOptions.type === 'Todos' || transaction.type === filterOptions.type;
      const matchesSearch = transaction.description.toLowerCase().includes(filterOptions.search.toLowerCase());
      return matchesType && matchesSearch;
    });
  };

  const exportToCSV = () => {
    const filteredData = applyFilters();
    
    if (filteredData.length === 0) {
      toast({
        title: "No hay datos",
        description: "No hay transacciones para exportar",
        variant: "destructive"
      });
      return;
    }

    const headers = ['Fecha', 'Descripción', 'Tipo', 'Cantidad'];
    const csvData = [
      headers.join(','),
      ...filteredData.map(t => [
        new Date(t.date).toLocaleDateString('es-ES'),
        `"${t.description}"`,
        t.type,
        t.amount.toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transacciones_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "¡Exportado!",
      description: "Archivo descargado correctamente"
    });
  };

  const updateFilter = (field: keyof typeof filterOptions, value: string) => {
    setFilterOptions(prev => ({ ...prev, [field]: value }));
  };

  const filteredTransactions = applyFilters();

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-light text-gray-800">
          Historial <span className="text-lg text-gray-500">({filteredTransactions.length})</span>
        </h3>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-medium"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50/50 rounded-2xl border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por tipo
              </label>
              <select
                value={filterOptions.type}
                onChange={(e) => updateFilter('type', e.target.value as 'Todos' | 'Ingreso' | 'Gasto')}
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
                value={filterOptions.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                placeholder="Buscar transacciones..."
              />
            </div>
          </div>
        </div>
      )}
      
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg font-light">
            {transactions.length === 0 
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
              {filteredTransactions
                .sort((a, b) => b.date - a.date)
                .map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-white/50 transition-colors duration-200">
                    <td className="py-4 px-4 text-sm text-gray-600 font-light">
                      {new Date(transaction.date).toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-4 px-4 text-sm font-light">{transaction.description}</td>
                    <td className="py-4 px-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        transaction.type === 'Ingreso' 
                          ? 'bg-green-100/80 text-green-700 border border-green-200' 
                          : 'bg-red-100/80 text-red-700 border border-red-200'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className={`py-4 px-4 text-sm text-right font-medium ${
                      transaction.type === 'Ingreso' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'Ingreso' ? '+' : '-'}€{transaction.amount.toFixed(2)}
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

export default TransactionHistory;
