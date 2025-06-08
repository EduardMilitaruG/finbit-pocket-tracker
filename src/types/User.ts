
export interface User {
  id: string;
  username: string;
  email?: string;
  created_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  type: 'Ingreso' | 'Gasto';
  date: string;
  created_at?: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  description?: string;
  deadline?: string;
  created_at?: string;
}
