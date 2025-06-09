
import { supabase } from "@/integrations/supabase/client";

class DataService {
  // Profile management methods
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // No rows found
      throw error;
    }
    return data;
  }

  async createUserProfile(userId: string, displayName: string) {
    const { data, error } = await supabase
      .from('perfiles')
      .insert({
        id: userId,
        nombre_usuario: displayName
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Transaction management methods
  async addNewTransaction(userId: string, description: string, amount: number, type: 'Ingreso' | 'Gasto') {
    const { data, error } = await supabase
      .from('transacciones')
      .insert({
        usuario_id: userId,
        descripcion: description,
        cantidad: amount,
        tipo: type
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

  async fetchUserTransactions(userId: string) {
    const { data, error } = await supabase
      .from('transacciones')
      .select('*')
      .eq('usuario_id', userId)
      .order('fecha', { ascending: false });

    if (error) throw error;

    return data.map(transaction => ({
      id: transaction.id,
      description: transaction.descripcion,
      amount: parseFloat(transaction.cantidad),
      type: transaction.tipo as 'Ingreso' | 'Gasto',
      date: new Date(transaction.fecha).getTime()
    }));
  }

  // Savings goals management methods
  async createSavingsGoal(
    userId: string, 
    title: string, 
    targetAmount: number, 
    description?: string, 
    deadline?: number
  ) {
    const { data, error } = await supabase
      .from('objetivos_ahorro')
      .insert({
        usuario_id: userId,
        titulo: title,
        cantidad_objetivo: targetAmount,
        descripcion: description,
        fecha_limite: deadline ? new Date(deadline).toISOString() : null
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

  async fetchUserSavingsGoals(userId: string) {
    const { data, error } = await supabase
      .from('objetivos_ahorro')
      .select('*')
      .eq('usuario_id', userId)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;

    return data.map(goal => ({
      id: goal.id,
      title: goal.titulo,
      targetAmount: parseFloat(goal.cantidad_objetivo),
      currentAmount: parseFloat(goal.cantidad_actual),
      description: goal.descripcion,
      deadline: goal.fecha_limite ? new Date(goal.fecha_limite).getTime() : undefined,
      createdAt: new Date(goal.fecha_creacion).getTime()
    }));
  }

  async updateSavingsGoalAmount(goalId: string, newAmount: number) {
    const { error } = await supabase
      .from('objetivos_ahorro')
      .update({ cantidad_actual: newAmount })
      .eq('id', goalId);

    if (error) throw error;
  }
}

export const dataService = new DataService();
