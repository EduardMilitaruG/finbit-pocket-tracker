
import React, { useState } from 'react';
import { User, Transaction } from '../types/User';
import { indexedDBService } from '../services/IndexedDBService';
import { LogOut, Trash2, Download, Upload, User as UserIcon } from 'lucide-react';

interface ProfileProps {
  user: User;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleResetData = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar todos tus datos? Esta acción no se puede deshacer.')) {
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Clear all data for the current user
      const transactions = await indexedDBService.getTransactionsByUserId(user.id);
      const savingsGoals = await indexedDBService.getSavingsGoalsByUserId(user.id);
      
      // Note: In a real app, we would need delete methods in IndexedDBService
      // For now, we'll show a message
      setMessage('Funcionalidad de reset en desarrollo. Por ahora, puedes cerrar sesión y crear una nueva cuenta.');
    } catch (error) {
      console.error('Error resetting data:', error);
      setMessage('Error al resetear los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const transactions = await indexedDBService.getTransactionsByUserId(user.id);
      
      if (transactions.length === 0) {
        setMessage('No hay transacciones para exportar');
        return;
      }

      // Create CSV content
      const headers = ['Fecha', 'Descripción', 'Cantidad', 'Tipo'];
      const csvContent = [
        headers.join(','),
        ...transactions.map(t => [
          new Date(t.date).toLocaleDateString('es-ES'),
          `"${t.description}"`,
          t.amount,
          t.type
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `finbit-transacciones-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessage('¡Transacciones exportadas exitosamente!');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setMessage('Error al exportar las transacciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setMessage('');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        // Validate CSV format
        if (headers.length < 4 || !headers.includes('Descripción') || !headers.includes('Cantidad') || !headers.includes('Tipo')) {
          setMessage('Formato de CSV inválido. Debe tener columnas: Fecha, Descripción, Cantidad, Tipo');
          return;
        }

        let importedCount = 0;
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const values = line.split(',');
          if (values.length < 4) continue;

          const description = values[1].replace(/"/g, '');
          const amount = parseFloat(values[2]);
          const type = values[3] as 'Ingreso' | 'Gasto';

          if (description && !isNaN(amount) && (type === 'Ingreso' || type === 'Gasto')) {
            await indexedDBService.addTransaction(user.id, description, amount, type);
            importedCount++;
          }
        }

        setMessage(`¡${importedCount} transacciones importadas exitosamente!`);
      } catch (error) {
        console.error('Error importing CSV:', error);
        setMessage('Error al importar las transacciones');
      } finally {
        setIsLoading(false);
        // Reset file input
        event.target.value = '';
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
        <h3 className="text-2xl font-light text-gray-800 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-white" />
          </div>
          Perfil de Usuario
        </h3>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
          <p className="text-lg font-medium text-gray-800 mb-2">Usuario: {user.username}</p>
          <p className="text-sm text-gray-600">ID de Usuario: #{user.id}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
        <h4 className="text-xl font-light text-gray-800 mb-6">Acciones de Cuenta</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={isLoading}
            className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Download className="w-5 h-5" />
            Exportar a CSV
          </button>

          {/* Import CSV */}
          <label className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-4 rounded-2xl hover:from-blue-600 hover:to-teal-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer">
            <Upload className="w-5 h-5" />
            Importar CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
              disabled={isLoading}
            />
          </label>

          {/* Reset Data */}
          <button
            onClick={handleResetData}
            disabled={isLoading}
            className="flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Trash2 className="w-5 h-5" />
            Resetear Datos
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="flex items-center gap-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-4 rounded-2xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>

        {message && (
          <div className={`mt-6 p-4 rounded-2xl text-sm font-medium ${
            message.includes('exitosamente') || message.includes('importadas')
              ? 'bg-green-100/80 text-green-700 border border-green-200' 
              : 'bg-red-100/80 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* CSV Format Info */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
        <h4 className="text-xl font-light text-gray-800 mb-4">Formato CSV para Importación</h4>
        <div className="bg-gray-50 rounded-2xl p-4 font-mono text-sm">
          <p className="text-gray-600 mb-2">El archivo CSV debe tener las siguientes columnas:</p>
          <p className="text-gray-800">Fecha,Descripción,Cantidad,Tipo</p>
          <p className="text-gray-600 mt-2 text-xs">Ejemplo:</p>
          <p className="text-gray-800">01/01/2024,"Salario",1200,Ingreso</p>
          <p className="text-gray-800">02/01/2024,"Compra supermercado",50,Gasto</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
