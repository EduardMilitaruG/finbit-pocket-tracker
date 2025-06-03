
export interface User {
  id: number;
  username: string;
  password: string;
}

export interface Transaction {
  id: number;
  userId: number;
  description: string;
  amount: number;
  type: 'Ingreso' | 'Gasto';
  date: number;
}

export interface SavingsGoal {
  id: number;
  userId: number;
  title: string;
  targetAmount: number;
  currentAmount: number;
  description?: string;
  deadline?: number;
  createdAt: number;
}
