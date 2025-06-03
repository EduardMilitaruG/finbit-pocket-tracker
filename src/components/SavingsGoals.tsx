
import React, { useState, useEffect } from 'react';
import { indexedDBService } from '../services/IndexedDBService';
import { SavingsGoal } from '../types/User';
import { Target, Plus, TrendingUp, Calendar } from 'lucide-react';

interface SavingsGoalsProps {
  userId: number;
}

const SavingsGoals: React.FC<SavingsGoalsProps> = ({ userId }) => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadGoals();
  }, [userId]);

  const loadGoals = async () => {
    try {
      const userGoals = await indexedDBService.getSavingsGoalsByUserId(userId);
      setGoals(userGoals);
    } catch (error) {
      console.error('Error loading savings goals:', error);
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const deadlineTimestamp = deadline ? new Date(deadline).getTime() : undefined;
      await indexedDBService.addSavingsGoal(
        userId,
        title,
        parseFloat(targetAmount),
        description || undefined,
        deadlineTimestamp
      );
      
      setMessage('¡Objetivo de ahorro creado exitosamente!');
      setTitle('');
      setTargetAmount('');
      setDescription('');
      setDeadline('');
      setShowForm(false);
      await loadGoals();
    } catch (error) {
      console.error('Error adding savings goal:', error);
      setMessage('Error al crear objetivo de ahorro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAmount = async (goalId: number, currentAmount: number, increment: number) => {
    try {
      const newAmount = Math.max(0, currentAmount + increment);
      await indexedDBService.updateSavingsGoalAmount(goalId, newAmount);
      await loadGoals();
    } catch (error) {
      console.error('Error updating savings goal:', error);
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Nuevo Objetivo
          </button>
        </div>
      </div>

      {/* Add Goal Form */}
      {showForm && (
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <h4 className="text-xl font-light text-gray-800 mb-6">Crear Nuevo Objetivo</h4>
          
          <form onSubmit={handleAddGoal} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título del Objetivo
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/80 backdrop-blur-sm font-light text-lg transition-all duration-200"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isLoading ? 'Creando...' : 'Crear Objetivo'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 text-gray-700 px-8 py-4 rounded-2xl hover:bg-gray-300 transition-all duration-200 font-medium text-lg"
              >
                Cancelar
              </button>
            </div>
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
      )}

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.length === 0 ? (
          <div className="col-span-full bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12 border border-white/20 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-light">
              No tienes objetivos de ahorro. ¡Crea tu primer objetivo!
            </p>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount);
            const isCompleted = progress >= 100;
            
            return (
              <div key={goal.id} className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/20">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h5 className="text-lg font-medium text-gray-800 mb-1">{goal.title}</h5>
                    {goal.description && (
                      <p className="text-sm text-gray-600 font-light">{goal.description}</p>
                    )}
                  </div>
                  {isCompleted && (
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>€{goal.currentAmount.toFixed(2)}</span>
                    <span>€{goal.targetAmount.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                          : 'bg-gradient-to-r from-purple-400 to-pink-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-center mt-2">
                    <span className={`text-sm font-medium ${
                      isCompleted ? 'text-green-600' : 'text-purple-600'
                    }`}>
                      {progress.toFixed(1)}% completado
                    </span>
                  </div>
                </div>

                {/* Deadline */}
                {goal.deadline && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>Hasta: {new Date(goal.deadline).toLocaleDateString('es-ES')}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateAmount(goal.id, goal.currentAmount, 10)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 px-4 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 text-sm font-medium"
                  >
                    +€10
                  </button>
                  <button
                    onClick={() => handleUpdateAmount(goal.id, goal.currentAmount, 50)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white py-2 px-4 rounded-xl hover:from-blue-600 hover:to-teal-600 transition-all duration-200 text-sm font-medium"
                  >
                    +€50
                  </button>
                  <button
                    onClick={() => handleUpdateAmount(goal.id, goal.currentAmount, -10)}
                    disabled={goal.currentAmount <= 0}
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

export default SavingsGoals;
