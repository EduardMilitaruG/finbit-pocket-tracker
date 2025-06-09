
import React, { useState } from 'react';
import { User } from '../types/User';
import { supabaseService } from '../services/SupabaseService';
import { LogOut, Trash2, Download, Upload, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProfileProps {
  user: User;
  onLogout: () => void;
}

const Perfil: React.FC<ProfileProps> = ({ user, onLogout }) => {
  const [cargando, setCargando] = useState(false);
  const { toast } = useToast();

  const manejarResetearDatos = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar todos tus datos? Esta acción no se puede deshacer.')) {
      return;
    }

    setCargando(true);

    try {
      toast({
        title: "Información",
        description: "La funcionalidad de reset está en desarrollo. Actualmente solo puedes cerrar sesión.",
      });
    } catch (error) {
      console.error('Error reseteando datos:', error);
      toast({
        title: "Error",
        description: "Error al resetear los datos",
        variant: "destructive"
      });
    } finally {
      setCargando(false);
    }
  };

  const manejarExportarCSV = async () => {
    if (!user?.id) return;
    
    setCargando(true);

    try {
      const transacciones = await supabaseService.obtenerTransaccionesPorUsuario(user.id);
      
      if (transacciones.length === 0) {
        toast({
          title: "Sin datos",
          description: "No hay transacciones para exportar",
          variant: "destructive"
        });
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

      toast({
        title: "¡Exportado!",
        description: "Transacciones exportadas exitosamente"
      });
    } catch (error) {
      console.error('Error exportando CSV:', error);
      toast({
        title: "Error",
        description: "Error al exportar las transacciones",
        variant: "destructive"
      });
    } finally {
      setCargando(false);
    }
  };

  const manejarImportarCSV = async (evento: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    if (!archivo || !user?.id) return;

    setCargando(true);

    const lector = new FileReader();
    lector.onload = async (e) => {
      try {
        const csv = e.target?.result as string;
        const lineas = csv.split('\n');
        const encabezados = lineas[0].split(',');
        
        if (encabezados.length < 4 || !encabezados.includes('Descripción') || !encabezados.includes('Cantidad') || !encabezados.includes('Tipo')) {
          toast({
            title: "Error",
            description: "Formato de CSV inválido. Debe tener columnas: Fecha, Descripción, Cantidad, Tipo",
            variant: "destructive"
          });
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
            await supabaseService.agregarTransaccion(user.id, descripcion, cantidad, tipo);
            contadorImportadas++;
          }
        }

        toast({
          title: "¡Importado!",
          description: `${contadorImportadas} transacciones importadas exitosamente`
        });
      } catch (error) {
        console.error('Error importando CSV:', error);
        toast({
          title: "Error",
          description: "Error al importar las transacciones",
          variant: "destructive"
        });
      } finally {
        setCargando(false);
        evento.target.value = '';
      }
    };

    lector.readAsText(archivo);
  };

  const manejarCerrarSesion = async () => {
    setCargando(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error cerrando sesión:', error);
        toast({
          title: "Error",
          description: "Error al cerrar sesión",
          variant: "destructive"
        });
      } else {
        onLogout();
      }
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      toast({
        title: "Error",
        description: "Error al cerrar sesión",
        variant: "destructive"
      });
    } finally {
      setCargando(false);
    }
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
          <p className="text-sm text-gray-600">ID de Usuario: {user.id}</p>
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
            onClick={manejarCerrarSesion}
            disabled={cargando}
            className="flex items-center gap-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-4 rounded-2xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 disabled:opacity-50 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <LogOut className="w-5 h-5" />
            {cargando ? 'Cerrando...' : 'Cerrar Sesión'}
          </button>
        </div>
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
