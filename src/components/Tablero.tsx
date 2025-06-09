import React, { useState, useEffect } from 'react';
import { servicioSupabase } from '../services/SupabaseService';
import { User, Transaction } from '../types/User';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import ObjetivosAhorro from './SavingsGoals';
import Perfil from './Profile';
import Mercados from './Markets';
import ConexionBancaria from './ConexionBancaria';
import { useToast } from '@/hooks/use-toast';

// Importar nuevos componentes
import EncabezadoTablero from './dashboard/EncabezadoTablero';
import TarjetaEstadistica from './dashboard/TarjetaEstadistica';
import PestanasNavegacion from './dashboard/PestanasNavegacion';
import FormularioTransaccion from './dashboard/FormularioTransaccion';
import HistorialTransacciones from './dashboard/HistorialTransacciones';
import GraficoBalanceMensual from './dashboard/GraficoBalanceMensual';
import WidgetMonedas from './dashboard/WidgetMonedas';

interface PropiedadesTablero {
  usuario: User;
  alCerrarSesion: () => void;
}

type SeleccionPestana = 'transacciones' | 'ahorros' | 'mercados' | 'perfil' | 'banco';

const Tablero: React.FC<PropiedadesTablero> = ({ usuario, alCerrarSesion }) => {
  const [transaccionesUsuario, setTransaccionesUsuario] = useState<Transaction[]>([]);
  const [estaProcesando, setEstaProcesando] = useState(false);
  const [pestanaActual, setPestanaActual] = useState<SeleccionPestana>('transacciones');
  
  const { toast } = useToast();

  useEffect(() => {
    if (usuario?.id) {
      cargarDatosUsuario();
      asegurarPerfilUsuario();
    }
  }, [usuario?.id]);

  const asegurarPerfilUsuario = async () => {
    if (!usuario?.id) return;
    
    try {
      const perfilExistente = await servicioSupabase.obtenerPerfil(usuario.id);
      if (!perfilExistente) {
        await servicioSupabase.crearPerfil(usuario.id, usuario.username);
      }
    } catch (error) {
      console.error('Verificación de perfil falló:', error);
    }
  };

  const cargarDatosUsuario = async () => {
    if (!usuario?.id) return;
    
    try {
      console.log('Cargando transacciones para usuario:', usuario.id);
      const transacciones = await servicioSupabase.obtenerTransaccionesPorUsuario(usuario.id);
      setTransaccionesUsuario(transacciones);
    } catch (error) {
      console.error('Error al cargar transacciones:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las transacciones",
        variant: "destructive"
      });
    }
  };

  const manejarTransaccionesImportadas = async (transaccionesImportadas: any[]) => {
    if (!usuario?.id) return;

    try {
      for (const transaccion of transaccionesImportadas) {
        await servicioSupabase.agregarTransaccion(
          usuario.id,
          transaccion.descripcion,
          transaccion.cantidad,
          transaccion.tipo
        );
      }

      toast({
        title: "¡Éxito!",
        description: `Se importaron ${transaccionesImportadas.length} transacciones correctamente`
      });

      await cargarDatosUsuario();
    } catch (error) {
      console.error('Importación falló:', error);
      toast({
        title: "Error",
        description: "No se pudieron importar todas las transacciones",
        variant: "destructive"
      });
    }
  };

  const manejarNuevaTransaccion = async (
    descripcion: string, 
    cantidad: number, 
    tipo: 'Ingreso' | 'Gasto',
    objetivoAhorroId?: string
  ) => {
    if (!usuario?.id) return;

    setEstaProcesando(true);

    try {
      console.log('Agregando transacción para usuario:', usuario.id);
      await servicioSupabase.agregarTransaccion(usuario.id, descripcion, cantidad, tipo, objetivoAhorroId);
      
      // Si la transacción está vinculada a un objetivo, actualizar el monto del objetivo
      if (objetivoAhorroId && tipo === 'Ingreso') {
        try {
          await servicioSupabase.calcularYActualizarMontoObjetivo(objetivoAhorroId);
        } catch (error) {
          console.error('Error actualizando objetivo:', error);
        }
      }
      
      toast({
        title: "¡Perfecto!",
        description: "Transacción agregada correctamente"
      });
      await cargarDatosUsuario();
    } catch (error) {
      console.error('Creación de transacción falló:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar la transacción",
        variant: "destructive"
      });
      throw error; // Re-lanzar para que el formulario lo maneje
    } finally {
      setEstaProcesando(false);
    }
  };

  // Calcular estadísticas financieras
  const calcularEstadisticas = () => {
    const saldoTotal = transaccionesUsuario.reduce((saldo, transaccion) => {
      return transaccion.type === 'Ingreso' 
        ? saldo + transaccion.amount 
        : saldo - transaccion.amount;
    }, 0);

    const totalIngresos = transaccionesUsuario
      .filter(t => t.type === 'Ingreso')
      .reduce((total, t) => total + t.amount, 0);

    const totalGastos = transaccionesUsuario
      .filter(t => t.type === 'Gasto')
      .reduce((total, t) => total + t.amount, 0);

    return { saldoTotal, totalIngresos, totalGastos };
  };

  const { saldoTotal, totalIngresos, totalGastos } = calcularEstadisticas();

  const renderizarContenidoPestana = () => {
    switch (pestanaActual) {
      case 'transacciones':
        return (
          <div className="space-y-6">
            <FormularioTransaccion 
              alEnviar={manejarNuevaTransaccion}
              estaCargando={estaProcesando}
              userId={usuario.id}
            />
            
            {/* Gráfico de Balance Mensual */}
            <GraficoBalanceMensual transacciones={transaccionesUsuario} />
            
            {/* Widget de Monedas */}
            <WidgetMonedas />
            
            <HistorialTransacciones transacciones={transaccionesUsuario} />
          </div>
        );
      case 'ahorros':
        return usuario?.id ? <ObjetivosAhorro userId={usuario.id} /> : null;
      case 'banco':
        return <ConexionBancaria userId={usuario.id} onTransaccionesImportadas={manejarTransaccionesImportadas} />;
      case 'mercados':
        return <Mercados />;
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
          cantidad={saldoTotal}
          icono={DollarSign}
          esquemaColor="neutral"
        />
        <TarjetaEstadistica
          titulo="Total Ingresos"
          cantidad={totalIngresos}
          icono={TrendingUp}
          esquemaColor="positivo"
        />
        <TarjetaEstadistica
          titulo="Total Gastos"
          cantidad={totalGastos}
          icono={TrendingDown}
          esquemaColor="negativo"
        />
      </div>

      <PestanasNavegacion 
        pestanaActiva={pestanaActual}
        alCambiarPestana={setPestanaActual}
      />

      {renderizarContenidoPestana()}
    </div>
  );
};

export default Tablero;
