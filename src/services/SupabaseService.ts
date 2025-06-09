
import { supabase } from "@/integrations/supabase/client";

class ServicioSupabase {
  // Métodos para perfiles de usuario
  async obtenerPerfil(userId: string) {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }
    return data;
  }

  async crearPerfil(userId: string, nombreUsuario: string) {
    const { data, error } = await supabase
      .from('perfiles')
      .insert({
        id: userId,
        nombre_usuario: nombreUsuario
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Métodos para transacciones
  async agregarTransaccion(userId: string, descripcion: string, cantidad: number, tipo: 'Ingreso' | 'Gasto') {
    const { data, error } = await supabase
      .from('transacciones')
      .insert({
        usuario_id: userId,
        descripcion,
        cantidad,
        tipo
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      description: data.descripcion,
      amount: parseFloat(data.cantidad),
      type: data.tipo,
      date: new Date(data.fecha).getTime(),
      userId: data.usuario_id
    };
  }

  async obtenerTransaccionesPorUsuario(userId: string) {
    const { data, error } = await supabase
      .from('transacciones')
      .select('*')
      .eq('usuario_id', userId)
      .order('fecha', { ascending: false });

    if (error) throw error;

    return data.map(t => ({
      id: t.id,
      description: t.descripcion,
      amount: parseFloat(t.cantidad),
      type: t.tipo as 'Ingreso' | 'Gasto',
      date: new Date(t.fecha).getTime()
    }));
  }

  // Métodos para objetivos de ahorro
  async agregarObjetivoAhorro(
    userId: string, 
    titulo: string, 
    cantidadObjetivo: number, 
    descripcion?: string, 
    fechaLimite?: number
  ) {
    const { data, error } = await supabase
      .from('objetivos_ahorro')
      .insert({
        usuario_id: userId,
        titulo,
        cantidad_objetivo: cantidadObjetivo,
        descripcion,
        fecha_limite: fechaLimite ? new Date(fechaLimite).toISOString() : null
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.titulo,
      targetAmount: parseFloat(data.cantidad_objetivo),
      currentAmount: parseFloat(data.cantidad_actual),
      description: data.descripcion,
      deadline: data.fecha_limite ? new Date(data.fecha_limite).getTime() : undefined,
      createdAt: new Date(data.fecha_creacion).getTime()
    };
  }

  async obtenerObjetivosAhorroPorUsuario(userId: string) {
    const { data, error } = await supabase
      .from('objetivos_ahorro')
      .select('*')
      .eq('usuario_id', userId)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;

    return data.map(obj => ({
      id: obj.id,
      title: obj.titulo,
      targetAmount: parseFloat(obj.cantidad_objetivo),
      currentAmount: parseFloat(obj.cantidad_actual),
      description: obj.descripcion,
      deadline: obj.fecha_limite ? new Date(obj.fecha_limite).getTime() : undefined,
      createdAt: new Date(obj.fecha_creacion).getTime()
    }));
  }

  async actualizarCantidadObjetivoAhorro(idObjetivo: string, nuevaCantidad: number) {
    const { error } = await supabase
      .from('objetivos_ahorro')
      .update({ cantidad_actual: nuevaCantidad })
      .eq('id', idObjetivo);

    if (error) throw error;
  }
}

export const supabaseService = new ServicioSupabase();
