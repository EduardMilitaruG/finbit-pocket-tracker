
export interface User {
  id: string; // Cambiar a string para compatibilidad con Supabase/Clerk
  username: string;
  password: string;
}

export interface Transaction {
  id: string; // Cambiar a string para compatibilidad con Supabase
  userId?: string; // Opcional ya que ahora manejamos esto en el servicio
  description: string;
  amount: number;
  type: 'Ingreso' | 'Gasto';
  date: number;
}

export interface SavingsGoal {
  id: string; // Cambiar a string para compatibilidad con Supabase
  userId?: string; // Opcional ya que ahora manejamos esto en el servicio
  title: string;
  targetAmount: number;
  currentAmount: number;
  description?: string;
  deadline?: number;
  createdAt: number;
}
