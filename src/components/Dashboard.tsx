
import React, { useState, useEffect } from 'react';
import { supabaseService } from '../services/SupabaseService';
import { User, Transaction } from '../types/User';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import SavingsGoals from './SavingsGoals';
import Profile from './Profile';
import Markets from './Markets';
import ConexionBancaria from './ConexionBancaria';
import { useToast } from '@/hooks/use-toast';

// Import new components
import DashboardHeader from './dashboard/DashboardHeader';
import StatCard from './dashboard/StatCard';
import NavigationTabs from './dashboard/NavigationTabs';
import TransactionForm from './dashboard/TransactionForm';
import TransactionHistory from './dashboard/TransactionHistory';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

type TabSelection = 'transacciones' | 'ahorros' | 'mercados' | 'perfil' | 'banco';

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabSelection>('transacciones');
  
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      loadUserData();
      ensureUserProfile();
    }
  }, [user?.id]);

  const ensureUserProfile = async () => {
    if (!user?.id) return;
    
    try {
      const existingProfile = await supabaseService.obtenerPerfil(user.id);
      if (!existingProfile) {
        await supabaseService.crearPerfil(user.id, user.username);
      }
    } catch (error) {
      console.error('Profile check failed:', error);
    }
  };

  const loadUserData = async () => {
    if (!user?.id) return;
    
    try {
      console.log('Loading transactions for user:', user.id);
      const transactions = await supabaseService.obtenerTransaccionesPorUsuario(user.id);
      setUserTransactions(transactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las transacciones",
        variant: "destructive"
      });
    }
  };

  const handleImportedTransactions = async (importedTransactions: any[]) => {
    if (!user?.id) return;

    try {
      for (const transaction of importedTransactions) {
        await supabaseService.agregarTransaccion(
          user.id,
          transaction.descripcion,
          transaction.cantidad,
          transaction.tipo
        );
      }

      toast({
        title: "¡Éxito!",
        description: `Se importaron ${importedTransactions.length} transacciones correctamente`
      });

      await loadUserData();
    } catch (error) {
      console.error('Import failed:', error);
      toast({
        title: "Error",
        description: "No se pudieron importar todas las transacciones",
        variant: "destructive"
      });
    }
  };

  const handleNewTransaction = async (description: string, amount: number, type: 'Ingreso' | 'Gasto') => {
    if (!user?.id) return;

    setIsProcessing(true);

    try {
      console.log('Adding transaction for user:', user.id);
      await supabaseService.agregarTransaccion(user.id, description, amount, type);
      toast({
        title: "¡Perfecto!",
        description: "Transacción agregada correctamente"
      });
      await loadUserData();
    } catch (error) {
      console.error('Transaction creation failed:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar la transacción",
        variant: "destructive"
      });
      throw error; // Re-throw to let form handle it
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate financial statistics
  const calculateStats = () => {
    const totalBalance = userTransactions.reduce((balance, transaction) => {
      return transaction.type === 'Ingreso' 
        ? balance + transaction.amount 
        : balance - transaction.amount;
    }, 0);

    const totalIncome = userTransactions
      .filter(t => t.type === 'Ingreso')
      .reduce((total, t) => total + t.amount, 0);

    const totalExpenses = userTransactions
      .filter(t => t.type === 'Gasto')
      .reduce((total, t) => total + t.amount, 0);

    return { totalBalance, totalIncome, totalExpenses };
  };

  const { totalBalance, totalIncome, totalExpenses } = calculateStats();

  const renderTabContent = () => {
    switch (currentTab) {
      case 'transacciones':
        return (
          <>
            <TransactionForm 
              onSubmit={handleNewTransaction}
              isLoading={isProcessing}
            />
            <TransactionHistory transactions={userTransactions} />
          </>
        );
      case 'ahorros':
        return user?.id ? <SavingsGoals userId={user.id} /> : null;
      case 'banco':
        return <ConexionBancaria userId={user.id} onTransaccionesImportadas={handleImportedTransactions} />;
      case 'mercados':
        return <Markets />;
      case 'perfil':
        return <Profile user={user} onLogout={onLogout} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <DashboardHeader user={user} onLogout={onLogout} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Saldo Total"
          amount={totalBalance}
          icon={DollarSign}
          colorScheme="neutral"
        />
        <StatCard
          title="Total Ingresos"
          amount={totalIncome}
          icon={TrendingUp}
          colorScheme="positive"
        />
        <StatCard
          title="Total Gastos"
          amount={totalExpenses}
          icon={TrendingDown}
          colorScheme="negative"
        />
      </div>

      <NavigationTabs 
        activeTab={currentTab}
        onTabChange={setCurrentTab}
      />

      {renderTabContent()}
    </div>
  );
};

export default Dashboard;
