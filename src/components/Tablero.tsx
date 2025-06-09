
import React, { useState, useEffect } from 'react';
import { servicioSupabase } from '../services/SupabaseService';
import { User, Transaction } from '../types/User';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import ObjetivosAhorro from './SavingsGoals';
import Perfil from './Profile';
import PaginaMercados from './Markets';
import ConexionBancaria from './ConexionBancaria';
import { useToast } from '@/hooks/use-toast';

import EncabezadoTablero from './dashboard/EncabezadoTablero';
import TarjetaEstadistica from './dashboard/TarjetaEstadistica';
import PestanasNavegacion from './dashboard/PestanasNavegacion';
import FormularioTransaccion from './dashboard/FormularioTransaccion';
import HistorialTransacciones from './dashboard/HistorialTransacciones';

interface PropsTablero {
  usuario: User;
  alCerrarSesion: () => void;
}

type TipoPestana = 'transacciones' | 'ahorros' | 'mercados' | 'perfil' | 'banco';

const Tablero: React.FC<PropsTablero> = ({ usuario, alCerrarSesion }) => {
  const [listaTransacciones, setListaTransacciones] = useState<Transaction[]>([]);
  const [procesandoDatos, setProcesandoDatos] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState<TipoPestana>('transacciones');
  
  const { toast } = useToast();

  useEffect(() => {
    if (usuario?.id) {
      obtenerDatos();
      verificarPerfil();
    }
  }, [usuario?.id]);

  const verificarPerfil = async () => {
    if (!usuario?.id) return;
    
    try {
      const perfilUsuario = await servicioSupabase.obtenerPerfil(usuario.id);
      if (!perfilUsuario) {
        await servicioSupabase.crearPerfil(usuario.id, usuario.username);
      }
    } catch (error) {
      console.error('Error verificación perfil:', error);
    }
  };

  const obtenerDatos = async () => {
    if (!usuario?.id) return;
    
    try {
      console.log('Obteniendo transacciones usuario:', usuario.id);
      const transacciones = await servicioSupabase.obtenerTransaccionesPorUsuario(usuario.id);
      setListaTransacciones(transacciones);
    } catch (error) {
      console.error('Error carga datos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las transacciones",
        variant: "destructive"
      });
    }
  };

  const procesarImportacion = async (datosImportados: any[]) => {
    if (!usuario?.id) return;

    try {
      for (const item of datosImportados) {
        await servicioSupabase.agregarTransaccion(
          usuario.id,
          item.descripcion,
          item.cantidad,
          item.tipo
        );
      }

      toast({
        title: "¡Éxito!",
        description: `Se importaron ${datosImportados.length} transacciones correctamente`
      });

      await obtenerDatos();
    } catch (error) {
      console.error('Error importación:', error);
      toast({
        title: "Error",
        description: "No se pudieron importar todas las transacciones",
        variant: "destructive"
      });
    }
  };

  const agregarTransaccion = async (
    desc: string, 
    cantidad: number, 
    tipo: 'Ingreso' | 'Gasto',
    objetivoId?: string
  ) => {
    if (!usuario?.id) return;

    setProcesandoDatos(true);

    try {
      console.log('Creando transacción usuario:', usuario.id);
      await servicioSupabase.agregarTransaccion(usuario.id, desc, cantidad, tipo, objetivoId);
      
      if (objetivoId && tipo === 'Ingreso') {
        try {
          await servicioSupabase.calcularYActualizarMontoObjetivo(objetivoId);
        } catch (error) {
          console.error('Error actualizando objetivo:', error);
        }
      }
      
      toast({
        title: "¡Perfecto!",
        description: "Transacción agregada correctamente"
      });
      await obtenerDatos();
    } catch (error) {
      console.error('Error crear transacción:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar la transacción",
        variant: "destructive"
      });
      throw error;
    } finally {
      setProcesandoDatos(false);
    }
  };

  const obtenerEstadisticas = () => {
    const balance = listaTransacciones.reduce((total, item) => {
      return item.type === 'Ingreso' 
        ? total + item.amount 
        : total - item.amount;
    }, 0);

    const ingresosTotales = listaTransacciones
      .filter(t => t.type === 'Ingreso')
      .reduce((suma, t) => suma + t.amount, 0);

    const gastosTotales = listaTransacciones
      .filter(t => t.type === 'Gasto')
      .reduce((suma, t) => suma + t.amount, 0);

    return { balance, ingresosTotales, gastosTotales };
  };

  const { balance, ingresosTotales, gastosTotales } = obtenerEstadisticas();

  const mostrarContenido = () => {
    switch (seccionActiva) {
      case 'transacciones':
        return (
          <div className="space-y-6">
            <FormularioTransaccion 
              alEnviar={agregarTransaccion}
              estaCargando={procesandoDatos}
              userId={usuario.id}
            />
            
            <HistorialTransacciones transacciones={listaTransacciones} />
          </div>
        );
      case 'ahorros':
        return usuario?.id ? <ObjetivosAhorro userId={usuario.id} /> : null;
      case 'banco':
        return <ConexionBancaria userId={usuario.id} onTransaccionesImportadas={procesarImportacion} />;
      case 'mercados':
        return <PaginaMercados />;
      case 'perfil':
        return <Perfil user={usuario} onLogout={alCerrarSesion} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <EncabezadoTablero usuario={usuario} alCerrarSesion={alCerrarSesion} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TarjetaEstadistica
          titulo="Saldo Total"
          cantidad={balance}
          icono={DollarSign}
          esquemaColor="neutral"
        />
        <TarjetaEstadistica
          titulo="Total Ingresos"
          cantidad={ingresosTotales}
          icono={TrendingUp}
          esquemaColor="positivo"
        />
        <TarjetaEstadistica
          titulo="Total Gastos"
          cantidad={gastosTotales}
          icono={TrendingDown}
          esquemaColor="negativo"
        />
      </div>

      <PestanasNavegacion 
        pestanaActiva={seccionActiva}
        alCambiarPestana={setSeccionActiva}
      />

      {mostrarContenido()}
    </div>
  );
};

export default Tablero;
