
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction } from '../../types/User';
import { ChartContainer, ChartTooltipContent } from '../ui/chart';

interface PropiedadesGraficoBalance {
  transacciones: Transaction[];
}

const GraficoBalanceMensual: React.FC<PropiedadesGraficoBalance> = ({ transacciones }) => {
  // Procesar transacciones para crear datos mensuales
  const procesarDatosMensuales = () => {
    const datosPorMes: { [key: string]: number } = {};
    let balanceAcumulado = 0;

    // Ordenar transacciones por fecha
    const transaccionesOrdenadas = [...transacciones].sort((a, b) => a.date - b.date);

    transaccionesOrdenadas.forEach(transaccion => {
      const fecha = new Date(transaccion.date);
      const clavesMes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      
      if (transaccion.type === 'Ingreso') {
        balanceAcumulado += transaccion.amount;
      } else {
        balanceAcumulado -= transaccion.amount;
      }

      datosPorMes[clavesMes] = balanceAcumulado;
    });

    // Convertir a formato de gráfico
    return Object.entries(datosPorMes).map(([mes, balance]) => ({
      mes,
      balance: Number(balance.toFixed(2))
    }));
  };

  const datosGrafico = procesarDatosMensuales();

  const configuracionGrafico = {
    balance: {
      label: "Balance",
      color: "hsl(142, 76%, 36%)"
    }
  };

  if (datosGrafico.length === 0) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Balance Mensual</h3>
        <div className="text-center py-8 text-gray-500">
          No hay datos suficientes para mostrar el gráfico
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Evolución del Balance Mensual</h3>
      
      <ChartContainer config={configuracionGrafico} className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={datosGrafico} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
            <XAxis 
              dataKey="mes" 
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip 
              content={<ChartTooltipContent />}
              labelFormatter={(value) => `Mes: ${value}`}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Balance']}
            />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="var(--color-balance)"
              strokeWidth={3}
              dot={{ fill: "var(--color-balance)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "var(--color-balance)", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default GraficoBalanceMensual;
