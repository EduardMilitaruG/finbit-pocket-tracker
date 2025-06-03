import React, { useState, useEffect } from 'react';
import { indexedDBService } from '../services/IndexedDBService';
import { User, Transaction } from '../types/User';
import { LogOut, Plus, TrendingUp, TrendingDown, DollarSign, Target, User as UserIcon, BarChart3 } from 'lucide-react';
import SavingsGoals from './SavingsGoals';
import Profile from './Profile';
import Markets from './Markets';

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
  const [activeTab, setActiveTab] = useState<'transactions' | 'savings' | 'markets' | 'profile'>('transactions');

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

      {/* Balance Cards */}
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

      {/* Navigation Tabs */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="flex">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-4 px-6 font-medium transition-all duration-200 ${
              activeTab === 'transactions'
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
            onClick={() => setActiveTab('savings')}
            className={`flex-1 py-4 px-6 font-medium transition-all duration-200 ${
              activeTab === 'savings'
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
            onClick={() => setActiveTab('markets')}
            className={`flex-1 py-4 px-6 font-medium transition-all duration-200 ${
              activeTab === 'markets'
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
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-4 px-6 font-medium transition-all duration-200 ${
              activeTab === 'profile'
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

      {/* Tab Content */}
      {activeTab === 'transactions' ? (
        <>
          {/* Add Transaction Form */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-light text-gray-800 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-teal-500 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              Agregar Transacción
            </h3>
            
            <form onSubmit={handleAddTransaction} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
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
                    value={type}
                    onChange={(e) => setType(e.target.value as 'Ingreso' | 'Gasto')}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80 backdrop-blur-sm font-light text-lg transition-all duration-200"
                  >
                    <option value="Ingreso">Ingreso</option>
                    <option value="Gasto">Gasto</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-teal-500 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-teal-600 transition-all duration-200 disabled:opacity-50 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isLoading ? 'Agregando...' : 'Agregar Transacción'}
              </button>
            </form>

            {message && (
              <div className={`mt-6 p-4 rounded-2xl text-sm font-medium ${
                message.includes('exitosamente') 
                  ? 'bg-green-100/80 text-green-700 border border-green-200' 
                  : 'bg-red-100/80 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}
          </div>

          {/* Transactions List */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-light text-gray-800 mb-6">
              Historial de Transacciones <span className="text-lg text-gray-500">({transactions.length})</span>
            </h3>
            
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg font-light">
                  No hay transacciones registradas. ¡Agrega tu primera transacción!
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
                    {transactions
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
        </>
      ) : activeTab === 'savings' ? (
        <SavingsGoals userId={user.id} />
      ) : activeTab === 'markets' ? (
        <Markets />
      ) : (
        <Profile user={user} onLogout={onLogout} />
      )}
    </div>
  );
};

export default Dashboard;
