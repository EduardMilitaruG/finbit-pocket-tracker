
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  amount: number;
  icon: LucideIcon;
  colorScheme: 'positive' | 'negative' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ title, amount, icon: Icon, colorScheme }) => {
  const getColorClasses = () => {
    switch (colorScheme) {
      case 'positive':
        return {
          text: 'text-green-600',
          background: 'bg-gradient-to-br from-green-400 to-emerald-500'
        };
      case 'negative':
        return {
          text: 'text-red-600',
          background: 'bg-gradient-to-br from-red-400 to-pink-500'
        };
      default:
        return {
          text: amount >= 0 ? 'text-green-600' : 'text-red-600',
          background: amount >= 0 ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-red-400 to-pink-500'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-light mb-1">{title}</p>
          <p className={`text-3xl font-light ${colors.text}`}>
            €{Math.abs(amount).toFixed(2)}
          </p>
        </div>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${colors.background}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
