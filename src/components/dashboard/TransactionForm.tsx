
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TransactionFormProps {
  onSubmit: (description: string, amount: number, type: 'Ingreso' | 'Gasto') => Promise<void>;
  isLoading: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'Ingreso' as 'Ingreso' | 'Gasto'
  });
  const { toast } = useToast();

  const validateInput = () => {
    if (!formData.description.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor, agrega una descripción",
        variant: "destructive"
      });
      return false;
    }

    const parsedAmount = parseFloat(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({
        title: "Cantidad inválida",
        description: "La cantidad debe ser un número mayor que cero",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInput()) return;

    try {
      await onSubmit(formData.description, parseFloat(formData.amount), formData.type);
      
      // Reset form after successful submission
      setFormData({
        description: '',
        amount: '',
        type: 'Ingreso'
      });
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const updateFormField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
      <h3 className="text-2xl font-light text-gray-800 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-teal-500 rounded-full flex items-center justify-center">
          <Plus className="w-6 h-6 text-white" />
        </div>
        Nueva Transacción
      </h3>
      
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => updateFormField('description', e.target.value)}
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
              value={formData.amount}
              onChange={(e) => updateFormField('amount', e.target.value)}
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
              value={formData.type}
              onChange={(e) => updateFormField('type', e.target.value as 'Ingreso' | 'Gasto')}
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
          {isLoading ? 'Guardando...' : 'Agregar Transacción'}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
