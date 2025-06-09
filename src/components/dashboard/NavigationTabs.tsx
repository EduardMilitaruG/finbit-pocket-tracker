
import React from 'react';
import { Plus, Target, CreditCard, BarChart3, User as UserIcon } from 'lucide-react';

type TabOption = 'transacciones' | 'ahorros' | 'banco' | 'mercados' | 'perfil';

interface NavigationTabsProps {
  activeTab: TabOption;
  onTabChange: (tab: TabOption) => void;
}

const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onTabChange }) => {
  const tabConfigurations = [
    {
      id: 'transacciones' as TabOption,
      label: 'Transacciones',
      icon: Plus,
      gradient: 'from-blue-500 to-teal-500'
    },
    {
      id: 'ahorros' as TabOption,
      label: 'Objetivos de Ahorro',
      icon: Target,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'banco' as TabOption,
      label: 'Conectar Banco',
      icon: CreditCard,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'mercados' as TabOption,
      label: 'Mercados',
      icon: BarChart3,
      gradient: 'from-orange-500 to-yellow-500'
    },
    {
      id: 'perfil' as TabOption,
      label: 'Perfil',
      icon: UserIcon,
      gradient: 'from-gray-500 to-gray-600'
    }
  ];

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
      <div className="flex">
        {tabConfigurations.map((tab) => {
          const isCurrentTab = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 py-4 px-6 font-medium transition-all duration-200 ${
                isCurrentTab
                  ? `bg-gradient-to-r ${tab.gradient} text-white`
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Icon className="w-5 h-5" />
                {tab.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NavigationTabs;
