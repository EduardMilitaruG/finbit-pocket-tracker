import { User, Transaction, SavingsGoal } from '../types/User';

class IndexedDBService {
  private dbName = 'FinBitDB';
  private version = 2;
  private db: IDBDatabase | null = null;

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create usuarios store
        if (!db.objectStoreNames.contains('usuarios')) {
          const usuariosStore = db.createObjectStore('usuarios', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          usuariosStore.createIndex('username', 'username', { unique: true });
        }

        // Create movimientos store
        if (!db.objectStoreNames.contains('movimientos')) {
          const movimientosStore = db.createObjectStore('movimientos', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          movimientosStore.createIndex('userId', 'userId', { unique: false });
        }

        // Create savings goals store
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
      const transaction = this.db!.transaction(['usuarios'], 'readwrite');
      const store = transaction.objectStore('usuarios');
      
      const user = { username, password };
      const request = store.add(user);

      request.onsuccess = () => {
        const newUser = { ...user, id: request.result as number };
        console.log('User added successfully:', newUser);
        resolve(newUser);
      };

      request.onerror = () => {
        console.error('Error adding user:', request.error);
        reject(request.error);
      };
    });
  }

  async getUser(username: string, password: string): Promise<User | null> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['usuarios'], 'readonly');
      const store = transaction.objectStore('usuarios');
      const index = store.index('username');
      
      const request = index.get(username);

      request.onsuccess = () => {
        const user = request.result;
        if (user && user.password === password) {
          console.log('User found and authenticated:', user);
          resolve(user);
        } else {
          console.log('Invalid credentials');
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('Error getting user:', request.error);
        reject(request.error);
      };
    });
  }

  async addTransaction(userId: number, description: string, amount: number, type: 'Ingreso' | 'Gasto'): Promise<Transaction> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['movimientos'], 'readwrite');
      const store = transaction.objectStore('movimientos');
      
      const movimiento = {
        userId,
        description,
        amount,
        type,
        date: Date.now()
      };
      
      const request = store.add(movimiento);

      request.onsuccess = () => {
        const newTransaction = { ...movimiento, id: request.result as number };
        console.log('Transaction added successfully:', newTransaction);
        resolve(newTransaction);
      };

      request.onerror = () => {
        console.error('Error adding transaction:', request.error);
        reject(request.error);
      };
    });
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['movimientos'], 'readonly');
      const store = transaction.objectStore('movimientos');
      const index = store.index('userId');
      
      const request = index.getAll(userId);

      request.onsuccess = () => {
        const transactions = request.result || [];
        console.log('Transactions retrieved:', transactions);
        resolve(transactions);
      };

      request.onerror = () => {
        console.error('Error getting transactions:', request.error);
        reject(request.error);
      };
    });
  }

  async addSavingsGoal(userId: number, title: string, targetAmount: number, description?: string, deadline?: number): Promise<SavingsGoal> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['savingsGoals'], 'readwrite');
      const store = transaction.objectStore('savingsGoals');
      
      const goal = {
        userId,
        title,
        targetAmount,
        currentAmount: 0,
        description,
        deadline,
        createdAt: Date.now()
      };
      
      const request = store.add(goal);

      request.onsuccess = () => {
        const newGoal = { ...goal, id: request.result as number };
        console.log('Savings goal added successfully:', newGoal);
        resolve(newGoal);
      };

      request.onerror = () => {
        console.error('Error adding savings goal:', request.error);
        reject(request.error);
      };
    });
  }

  async getSavingsGoalsByUserId(userId: number): Promise<SavingsGoal[]> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['savingsGoals'], 'readonly');
      const store = transaction.objectStore('savingsGoals');
      const index = store.index('userId');
      
      const request = index.getAll(userId);

      request.onsuccess = () => {
        const goals = request.result || [];
        console.log('Savings goals retrieved:', goals);
        resolve(goals);
      };

      request.onerror = () => {
        console.error('Error getting savings goals:', request.error);
        reject(request.error);
      };
    });
  }

  async updateSavingsGoalAmount(goalId: number, newAmount: number): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['savingsGoals'], 'readwrite');
      const store = transaction.objectStore('savingsGoals');
      
      const getRequest = store.get(goalId);
      
      getRequest.onsuccess = () => {
        const goal = getRequest.result;
        if (goal) {
          goal.currentAmount = newAmount;
          const updateRequest = store.put(goal);
          
          updateRequest.onsuccess = () => {
            console.log('Savings goal updated successfully');
            resolve();
          };
          
          updateRequest.onerror = () => {
            console.error('Error updating savings goal:', updateRequest.error);
            reject(updateRequest.error);
          };
        } else {
          reject(new Error('Savings goal not found'));
        }
      };

      getRequest.onerror = () => {
        console.error('Error getting savings goal:', getRequest.error);
        reject(getRequest.error);
      };
    });
  }
}

export const indexedDBService = new IndexedDBService();
