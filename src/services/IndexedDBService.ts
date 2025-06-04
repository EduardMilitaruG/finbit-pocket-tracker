
import { User, Transaction, SavingsGoal } from '../types/User';

class IndexedDBService {
  private dbName = 'FinBitDB';
  private version = 2;
  private db: IDBDatabase | null = null;

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, this.version);

      req.onerror = () => {
        console.error('Error opening IndexedDB:', req.error);
        reject(req.error);
      };

      req.onsuccess = () => {
        this.db = req.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      req.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('usuarios')) {
          const usersStore = db.createObjectStore('usuarios', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          usersStore.createIndex('username', 'username', { unique: true });
        }

        if (!db.objectStoreNames.contains('movimientos')) {
          const movStore = db.createObjectStore('movimientos', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          movStore.createIndex('userId', 'userId', { unique: false });
        }

        if (!db.objectStoreNames.contains('savingsGoals')) {
          const savingsStore = db.createObjectStore('savingsGoals', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          savingsStore.createIndex('userId', 'userId', { unique: false });
        }
      };
    });
  }

  async addUser(username: string, password: string): Promise<User> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const trans = this.db!.transaction(['usuarios'], 'readwrite');
      const store = trans.objectStore('usuarios');
      
      const userData = { username, password };
      const req = store.add(userData);

      req.onsuccess = () => {
        const newUser = { ...userData, id: req.result as number };
        console.log('User added successfully:', newUser);
        resolve(newUser);
      };

      req.onerror = () => {
        console.error('Error adding user:', req.error);
        reject(req.error);
      };
    });
  }

  async getUser(username: string, password: string): Promise<User | null> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const trans = this.db!.transaction(['usuarios'], 'readonly');
      const store = trans.objectStore('usuarios');
      const index = store.index('username');
      
      const req = index.get(username);

      req.onsuccess = () => {
        const userData = req.result;
        if (userData && userData.password === password) {
          console.log('User found and authenticated:', userData);
          resolve(userData);
        } else {
          console.log('Invalid credentials');
          resolve(null);
        }
      };

      req.onerror = () => {
        console.error('Error getting user:', req.error);
        reject(req.error);
      };
    });
  }

  async addTransaction(userId: number, description: string, amount: number, type: 'Ingreso' | 'Gasto'): Promise<Transaction> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const trans = this.db!.transaction(['movimientos'], 'readwrite');
      const store = trans.objectStore('movimientos');
      
      const mov = {
        userId,
        description,
        amount,
        type,
        date: Date.now()
      };
      
      const req = store.add(mov);

      req.onsuccess = () => {
        const newTrans = { ...mov, id: req.result as number };
        console.log('Transaction added successfully:', newTrans);
        resolve(newTrans);
      };

      req.onerror = () => {
        console.error('Error adding transaction:', req.error);
        reject(req.error);
      };
    });
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const trans = this.db!.transaction(['movimientos'], 'readonly');
      const store = trans.objectStore('movimientos');
      const index = store.index('userId');
      
      const req = index.getAll(userId);

      req.onsuccess = () => {
        const transactions = req.result || [];
        console.log('Transactions retrieved:', transactions);
        resolve(transactions);
      };

      req.onerror = () => {
        console.error('Error getting transactions:', req.error);
        reject(req.error);
      };
    });
  }

  async addSavingsGoal(userId: number, title: string, targetAmount: number, description?: string, deadline?: number): Promise<SavingsGoal> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const trans = this.db!.transaction(['savingsGoals'], 'readwrite');
      const store = trans.objectStore('savingsGoals');
      
      const goal = {
        userId,
        title,
        targetAmount,
        currentAmount: 0,
        description,
        deadline,
        createdAt: Date.now()
      };
      
      const req = store.add(goal);

      req.onsuccess = () => {
        const newGoal = { ...goal, id: req.result as number };
        console.log('Savings goal added successfully:', newGoal);
        resolve(newGoal);
      };

      req.onerror = () => {
        console.error('Error adding savings goal:', req.error);
        reject(req.error);
      };
    });
  }

  async getSavingsGoalsByUserId(userId: number): Promise<SavingsGoal[]> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const trans = this.db!.transaction(['savingsGoals'], 'readonly');
      const store = trans.objectStore('savingsGoals');
      const index = store.index('userId');
      
      const req = index.getAll(userId);

      req.onsuccess = () => {
        const goals = req.result || [];
        console.log('Savings goals retrieved:', goals);
        resolve(goals);
      };

      req.onerror = () => {
        console.error('Error getting savings goals:', req.error);
        reject(req.error);
      };
    });
  }

  async updateSavingsGoalAmount(goalId: number, newAmount: number): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const trans = this.db!.transaction(['savingsGoals'], 'readwrite');
      const store = trans.objectStore('savingsGoals');
      
      const getReq = store.get(goalId);
      
      getReq.onsuccess = () => {
        const goal = getReq.result;
        if (goal) {
          goal.currentAmount = newAmount;
          const updateReq = store.put(goal);
          
          updateReq.onsuccess = () => {
            console.log('Savings goal updated successfully');
            resolve();
          };
          
          updateReq.onerror = () => {
            console.error('Error updating savings goal:', updateReq.error);
            reject(updateReq.error);
          };
        } else {
          reject(new Error('Savings goal not found'));
        }
      };

      getReq.onerror = () => {
        console.error('Error getting savings goal:', getReq.error);
        reject(getReq.error);
      };
    });
  }
}

export const indexedDBService = new IndexedDBService();
