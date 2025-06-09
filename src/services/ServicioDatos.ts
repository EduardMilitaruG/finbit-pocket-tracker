
import { supabase } from '@/integrations/supabase/client';
import { Transaction, SavingsGoal } from '../types/User';

class ServicioDatos {
  // Gestión de perfiles de usuario
  async obtenerPerfilUsuario(idUsuario: string) {
    console.log('Obteniendo perfil para usuario:', idUsuario);
    
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', idUsuario)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error obteniendo perfil:', error);
      throw error;
    }

    return data;
  }

  async crearPerfilUsuario(idUsuario: string, nombreUsuario: string) {
    console.log('Creando perfil para usuario:', idUsuario, 'con nombre:', nombreUsuario);
    
    const { data, error } = await supabase
      .from('perfiles')
      .insert([{
        id: idUsuario,
        nombre_usuario: nombreUsuario
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creando perfil:', error);
      throw error;
    }

    return data;
  }

  // Gestión de transacciones
  async agregarNuevaTransaccion(
    idUsuario: string, 
    descripcion: string, 
    cantidad: number, 
    tipo: 'Ingreso' | 'Gasto',
    objetivoAhorroId?: string
  ) {
    console.log('Agregando transacción:', { idUsuario, descripcion, cantidad, tipo, objetivoAhorroId });
    
    const datosTransaccion: any = {
      usuario_id: idUsuario,
      descripcion,
      cantidad,
      tipo,
      fecha: new Date().toISOString()
    };

    if (objetivoAhorroId) {
      datosTransaccion.objetivo_ahorro_id = objetivoAhorroId;
    }

    const { data, error } = await supabase
      .from('transacciones')
      .insert([datosTransaccion])
      .select()
      .single();

    if (error) {
      console.error('Error agregando transacción:', error);
      throw error;
    }

    return data;
  }

  async obtenerTransaccionesUsuario(idUsuario: string): Promise<Transaction[]> {
    console.log('Obteniendo transacciones para usuario:', idUsuario);
    
    const { data, error } = await supabase
      .from('transacciones')
      .select(`
        *,
        objetivos_ahorro:objetivo_ahorro_id (
          id,
          titulo
        )
      `)
      .eq('usuario_id', idUsuario)
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('Error obteniendo transacciones:', error);
      throw error;
    }

    // Transformar datos de base de datos a formato local
    return (data || []).map(transaccion => ({
      id: transaccion.id,
      description: transaccion.descripcion,
      amount: parseFloat(transaccion.cantidad),
      type: transaccion.tipo as 'Ingreso' | 'Gasto',
      date: new Date(transaccion.fecha).getTime(),
      savingsGoalId: transaccion.objetivo_ahorro_id,
      savingsGoalTitle: transaccion.objetivos_ahorro?.titulo
    }));
  }

  async obtenerTransaccionesPorObjetivo(idObjetivo: string): Promise<Transaction[]> {
    console.log('Obteniendo transacciones para objetivo:', idObjetivo);
    
    const { data, error } = await supabase
      .from('transacciones')
      .select('*')
      .eq('objetivo_ahorro_id', idObjetivo)
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('Error obteniendo transacciones por objetivo:', error);
      throw error;
    }

    return (data || []).map(transaccion => ({
      id: transaccion.id,
      description: transaccion.descripcion,
      amount: parseFloat(transaccion.cantidad),
      type: transaccion.tipo as 'Ingreso' | 'Gasto',
      date: new Date(transaccion.fecha).getTime(),
      savingsGoalId: transaccion.objetivo_ahorro_id
    }));
  }

  // Gestión de objetivos de ahorro
  async crearObjetivoAhorro(
    idUsuario: string,
    titulo: string,
    cantidadObjetivo: number,
    descripcion?: string,
    fechaLimite?: number
  ) {
    console.log('Creando objetivo de ahorro:', { idUsuario, titulo, cantidadObjetivo });
    
    const datosInsertar: any = {
      usuario_id: idUsuario,
      titulo,
      cantidad_objetivo: cantidadObjetivo,
      cantidad_actual: 0
    };

    if (descripcion) {
      datosInsertar.descripcion = descripcion;
    }

    if (fechaLimite) {
      datosInsertar.fecha_limite = new Date(fechaLimite).toISOString();
    }

    const { data, error } = await supabase
      .from('objetivos_ahorro')
      .insert([datosInsertar])
      .select()
      .single();

    if (error) {
      console.error('Error creando objetivo de ahorro:', error);
      throw error;
    }

    return data;
  }

  async obtenerObjetivosAhorroUsuario(idUsuario: string): Promise<SavingsGoal[]> {
    console.log('Obteniendo objetivos de ahorro para usuario:', idUsuario);
    
    const { data, error } = await supabase
      .from('objetivos_ahorro')
      .select('*')
      .eq('usuario_id', idUsuario)
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('Error obteniendo objetivos de ahorro:', error);
      throw error;
    }

    // Transformar datos de base de datos a formato local
    return (data || []).map(objetivo => ({
      id: objetivo.id,
      title: objetivo.titulo,
      targetAmount: parseFloat(objetivo.cantidad_objetivo),
      currentAmount: parseFloat(objetivo.cantidad_actual),
      description: objetivo.descripcion || '',
      deadline: objetivo.fecha_limite ? new Date(objetivo.fecha_limite).getTime() : undefined,
      createdAt: new Date(objetivo.fecha_creacion).getTime()
    }));
  }

  async actualizarCantidadObjetivoAhorro(idObjetivo: string, nuevaCantidad: number) {
    console.log('Actualizando cantidad de objetivo:', idObjetivo, 'nueva cantidad:', nuevaCantidad);
    
    const { data, error } = await supabase
      .from('objetivos_ahorro')
      .update({ cantidad_actual: nuevaCantidad })
      .eq('id', idObjetivo)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando cantidad de objetivo:', error);
      throw error;
    }

    return data;
  }

  async calcularYActualizarMontoObjetivo(idObjetivo: string) {
    console.log('Calculando y actualizando monto del objetivo:', idObjetivo);
    
    try {
      // Obtener todas las transacciones vinculadas a este objetivo
      const transacciones = await this.obtenerTransaccionesPorObjetivo(idObjetivo);
      
      // Calcular el monto total de ingresos vinculados al objetivo
      const montoTotal = transacciones
        .filter(t => t.type === 'Ingreso')
        .reduce((total, t) => total + t.amount, 0);

      // Actualizar el objetivo con el nuevo monto
      await this.actualizarCantidadObjetivoAhorro(idObjetivo, montoTotal);
      
      return montoTotal;
    } catch (error) {
      console.error('Error calculando monto del objetivo:', error);
      throw error;
    }
  }
}

export const servicioDatos = new ServicioDatos();
