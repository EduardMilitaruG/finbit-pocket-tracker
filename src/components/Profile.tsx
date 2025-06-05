
import React, { useState } from 'react';
import { User, Transaction } from '../types/User';
import { indexedDBService } from '../services/IndexedDBService';
import { LogOut, Trash2, Download, Upload, User as UserIcon } from 'lucide-react';

interface ProfileProps {
  user: User;
  onLogout: () => void;
}

const Perfil: React.FC<ProfileProps> = ({ user, onLogout }) => {
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const manejarResetearDatos = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar todos tus datos? Esta acción no se puede deshacer.')) {
      return;
    }

    setCargando(true);
    setMensaje('');

    try {
      const transacciones = await indexedDBService.obtenerTransaccionesPorUsuario(user.id);
      const objetivosAhorro = await indexedDBService.obtenerObjetivosAhorroPorUsuario(user.id);
      
      setMensaje('Funcionalidad de reset en desarrollo. Por ahora, puedes cerrar sesión y crear una nueva cuenta.');
    } catch (error) {
      console.error('Error reseteando datos:', error);
      setMensaje('Error al resetear los datos');
    } finally {
      setCargando(false);
    }
  };

  const manejarExportarCSV = async () => {
    setCargando(true);
    setMensaje('');

    try {
      const transacciones = await indexedDBService.obtenerTransaccionesPorUsuario(user.id);
      
      if (transacciones.length === 0) {
        setMensaje('No hay transacciones para exportar');
        return;
      }

      const encabezados = ['Fecha', 'Descripción', 'Cantidad', 'Tipo'];
      const contenidoCSV = [
        encabezados.join(','),
        ...transacciones.map(t => [
          new Date(t.date).toLocaleDateString('es-ES'),
          `"${t.description}"`,
          t.amount,
          t.type
        ].join(','))
      ].join('\n');

      const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
      const enlace = document.createElement('a');
      const url = URL.createObjectURL(blob);
      enlace.setAttribute('href', url);
      enlace.setAttribute('download', `finbit-transacciones-${new Date().toISOString().split('T')[0]}.csv`);
      enlace.style.visibility = 'hidden';
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);

      setMensaje('¡Transacciones exportadas exitosamente!');
    } catch (error) {
      console.error('Error exportando CSV:', error);
      setMensaje('Error al exportar las transacciones');
    } finally {
      setCargando(false);
    }
  };

  const manejarImportarCSV = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;

    setCargando(true);
    setMensaje('');

    const lector = new FileReader();
    lector.onload = async (e) => {
      try {
        const csv = e.target?.result as string;
        const lineas = csv.split('\n');
        const encabezados = lineas[0].split(',');
        
        if (encabezados.length < 4 || !encabezados.includes('Descripción') || !encabezados.includes('Cantidad') || !encabezados.includes('Tipo')) {
          setMensaje('Formato de CSV inválido. Debe tener columnas: Fecha, Descripción, Cantidad, Tipo');
          return;
        }

        let contadorImportadas = 0;
        for (let i = 1; i < lineas.length; i++) {
          const linea = lineas[i].trim();
          if (!linea) continue;

          const valores = linea.split(',');
          if (valores.length < 4) continue;

          const descripcion = valores[1].replace(/"/g, '');
          const cantidad = parseFloat(valores[2]);
          const tipo = valores[3] as 'Ingreso' | 'Gasto';

          if (descripcion && !isNaN(cantidad) && (tipo === 'Ingreso' || tipo === 'Gasto')) {
            await indexedDBService.agregarTransaccion(user.id, descripcion, cantidad, tipo);
            contadorImportadas++;
          }
        }

        setMensaje(`¡${contadorImportadas} transacciones importadas exitosamente!`);
      } catch (error) {
        console.error('Error importando CSV:', error);
        setMensaje('Error al importar las transacciones');
      } finally {
        setCargando(false);
        evento.target.value = '';
      }
    };

    lector.readAsText(archivo);
  };

  return (
    <div className="space-y-6">
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

      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
        <h4 className="text-xl font-light text-gray-800 mb-6">Acciones de Cuenta</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={manejarExportarCSV}
            disabled={cargando}
            className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Download className="w-5 h-5" />
            Exportar a CSV
          </button>

          <label className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-4 rounded-2xl hover:from-blue-600 hover:to-teal-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer">
            <Upload className="w-5 h-5" />
            Importar CSV
            <input
              type="file"
              accept=".csv"
              onChange={manejarImportarCSV}
              className="hidden"
              disabled={cargando}
            />
          </label>

          <button
            onClick={manejarResetearDatos}
            disabled={cargando}
            className="flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Trash2 className="w-5 h-5" />
            Resetear Datos
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-4 rounded-2xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>

        {mensaje && (
          <div className={`mt-6 p-4 rounded-2xl text-sm font-medium ${
            mensaje.includes('exitosamente') || mensaje.includes('importadas')
              ? 'bg-green-100/80 text-green-700 border border-green-200' 
              : 'bg-red-100/80 text-red-700 border border-red-200'
          }`}>
            {mensaje}
          </div>
        )}
      </div>

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

export default Perfil;
