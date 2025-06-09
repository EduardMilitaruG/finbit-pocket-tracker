
import { supabase } from '@/integrations/supabase/client';
import { User, Transaction, SavingsGoal } from '../types/User';

export class SupabaseService {
  // Auth methods
  async signUp(email: string, password: string, username: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username
        },
        emailRedirectTo: `${window.location.origin}/`
      }
    });

    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return profile ? {
      id: profile.id,
      username: profile.username,
      email: user.email,
      created_at: profile.created_at
    } as User : null;
  }

  // Transaction methods
  async getTransactions(userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map(transaction => ({
      ...transaction,
      type: transaction.type as 'Ingreso' | 'Gasto'
    }));
  }

  async addTransaction(description: string, amount: number, type: 'Ingreso' | 'Gasto'): Promise<Transaction> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        description,
        amount,
        type,
        date: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      type: data.type as 'Ingreso' | 'Gasto'
    };
  }

  // Savings goals methods
  async getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async addSavingsGoal(
    title: string,
    targetAmount: number,
    description?: string,
    deadline?: string
  ): Promise<SavingsGoal> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('savings_goals')
      .insert({
        user_id: user.id,
        title,
        target_amount: targetAmount,
        description,
        deadline: deadline ? new Date(deadline).toISOString() : null
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSavingsGoalAmount(id: string, currentAmount: number): Promise<SavingsGoal> {
    const { data, error } = await supabase
      .from('savings_goals')
      .update({ current_amount: currentAmount })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const supabaseService = new SupabaseService();
