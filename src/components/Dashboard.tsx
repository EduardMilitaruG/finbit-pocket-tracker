
import React, { useState, useEffect } from 'react';
import { indexedDBService } from '../services/IndexedDBService';
import { User, Transaction } from '../types/User';
import { LogOut, Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'Ingreso' | 'Gasto'>('Ingreso');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, [user.id]);

  const loadTransactions = async () => {
    try {
      const userTransactions = await indexedDBService.getTransactionsByUserId(user.id);
      setTransactions(userTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      await indexedDBService.addTransaction(user.id, description, parseFloat(amount), type);
      setMessage('¡Transacción agregada exitosamente!');
      setDescription('');
      setAmount('');
      setType('Ingreso');
      await loadTransactions();
    } catch (error) {
      console.error('Error adding transaction:', error);
      setMessage('Error al agregar transacción');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateBalance = () => {
    return transactions.reduce((balance, transaction) => {
      return transaction.type === 'Ingreso' 
        ? balance + transaction.amount 
        : balance - transaction.amount;
    }, 0);
  };

  const getTotalIngresos = () => {
    return transactions
      .filter(t => t.type === 'Ingreso')
      .reduce((total, t) => total + t.amount, 0);
  };

  const getTotalGastos = () => {
    return transactions
      .filter(t => t.type === 'Gasto')
      .reduce((total, t) => total + t.amount, 0);
  };

  const balance = calculateBalance();
  const totalIngresos = getTotalIngresos();
  const totalGastos = getTotalGastos();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Bienvenido, {user.username}
            </h2>
            <p className="text-gray-600">Panel de Control Financiero</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Saldo Total</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                €{balance.toFixed(2)}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              balance >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <DollarSign className={`w-6 h-6 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Ingresos</p>
              <p className="text-2xl font-bold text-green-600">€{totalIngresos.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Gastos</p>
              <p className="text-2xl font-bold text-red-600">€{totalGastos.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Add Transaction Form */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Agregar Transacción
        </h3>
        
        <form onSubmit={handleAddTransaction} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Salario, Compra supermercado..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'Ingreso' | 'Gasto')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Ingreso">Ingreso</option>
                <option value="Gasto">Gasto</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Agregando...' : 'Agregar Transacción'}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded-md text-sm ${
            message.includes('exitosamente') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Historial de Transacciones ({transactions.length})
        </h3>
        
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay transacciones registradas. ¡Agrega tu primera transacción!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Fecha</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Descripción</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Tipo</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {transactions
                  .sort((a, b) => b.date - a.date)
                  .map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(transaction.date).toLocaleDateString('es-ES')}
                      </td>
                      <td className="py-3 px-4 text-sm">{transaction.description}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'Ingreso' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-sm text-right font-medium ${
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
    </div>
  );
};

export default Dashboard;
