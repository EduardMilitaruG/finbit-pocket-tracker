
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Bitcoin } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface DatosPrecio {
  precio: number;
  cambio24h: number;
  timestamp: number;
}

interface DatosGrafico {
  hora: string;
  precio: number;
}

const Mercados: React.FC = () => {
  const [datosBitcoin, setDatosBitcoin] = useState<DatosPrecio | null>(null);
  const [datosSp500, setDatosSp500] = useState<DatosPrecio | null>(null);
  const [graficoBitcoin, setGraficoBitcoin] = useState<DatosGrafico[]>([]);
  const [graficoSp500, setGraficoSp500] = useState<DatosGrafico[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const generarDatosMockGrafico = (precioBase: number, puntos: number = 24) => {
    const datos: DatosGrafico[] = [];
    let precioActual = precioBase;
    
    for (let i = puntos; i >= 0; i--) {
      const hora = new Date(Date.now() - i * 60 * 60 * 1000).toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      const variacion = (Math.random() - 0.5) * 0.02;
      precioActual = precioActual * (1 + variacion);
      
      datos.push({
        hora,
        precio: Math.round(precioActual * 100) / 100
      });
    }
    
    return datos;
  };

  const obtenerDatosMercado = async () => {
    setCargando(true);
    setError('');
    
    try {
      const precioBitcoinMock = 65000 + (Math.random() - 0.5) * 10000;
      const precioSp500Mock = 4500 + (Math.random() - 0.5) * 500;
      
      setDatosBitcoin({
        precio: precioBitcoinMock,
        cambio24h: (Math.random() - 0.5) * 10,
        timestamp: Date.now()
      });
      
      setDatosSp500({
        precio: precioSp500Mock,
        cambio24h: (Math.random() - 0.5) * 4,
        timestamp: Date.now()
      });
      
      setGraficoBitcoin(generarDatosMockGrafico(precioBitcoinMock));
      setGraficoSp500(generarDatosMockGrafico(precioSp500Mock));
      
    } catch (err) {
      console.error('Error obteniendo datos del mercado:', err);
      setError('Error al cargar los datos del mercado');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerDatosMercado();
    
    const intervalo = setInterval(obtenerDatosMercado, 5 * 60 * 1000);
    
    return () => clearInterval(intervalo);
  }, []);

  const formatearPrecio = (precio: number, moneda: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: moneda === 'USD' ? 'USD' : 'EUR',
      minimumFractionDigits: moneda === 'USD' ? 2 : 0,
      maximumFractionDigits: moneda === 'USD' ? 2 : 0
    }).format(precio);
  };

  const configGrafico = {
    precio: {
      label: "Precio",
      color: "hsl(var(--chart-1))",
    },
  };

  if (cargando) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg font-light">Cargando datos del mercado...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
        <div className="text-center py-12">
          <p className="text-red-500 text-lg font-light">{error}</p>
          <button
            onClick={obtenerDatosMercado}
            className="mt-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-2xl hover:from-blue-600 hover:to-teal-600 transition-all duration-200 font-medium"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
        <h3 className="text-2xl font-light text-gray-800 mb-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          Mercados Financieros
        </h3>
        <p className="text-gray-600 font-light">Seguimiento en tiempo real de Bitcoin y S&P 500</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center">
                <Bitcoin className="w-7 h-7 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-medium text-gray-800">Bitcoin</h4>
                <p className="text-sm text-gray-600">BTC/USD</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-light text-gray-800">
                {datosBitcoin && formatearPrecio(datosBitcoin.precio, 'USD')}
              </p>
              {datosBitcoin && (
                <div className={`flex items-center gap-1 justify-end ${
                  datosBitcoin.cambio24h >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {datosBitcoin.cambio24h >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {datosBitcoin.cambio24h >= 0 ? '+' : ''}{datosBitcoin.cambio24h.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="h-48">
            <ChartContainer config={configGrafico}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graficoBitcoin}>
                  <XAxis dataKey="hora" axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="precio" 
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-medium text-gray-800">S&P 500</h4>
                <p className="text-sm text-gray-600">SPX</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-light text-gray-800">
                {datosSp500 && formatearPrecio(datosSp500.precio, 'USD')}
              </p>
              {datosSp500 && (
                <div className={`flex items-center gap-1 justify-end ${
                  datosSp500.cambio24h >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {datosSp500.cambio24h >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {datosSp500.cambio24h >= 0 ? '+' : ''}{datosSp500.cambio24h.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="h-48">
            <ChartContainer config={configGrafico}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graficoSp500}>
                  <XAxis dataKey="hora" axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="precio" 
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
        <h4 className="text-xl font-light text-gray-800 mb-4">Información del Mercado</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
          <div>
            <p className="mb-2"><strong>Bitcoin:</strong> La primera y más conocida criptomoneda descentralizada.</p>
            <p>Última actualización: {datosBitcoin && new Date(datosBitcoin.timestamp).toLocaleString('es-ES')}</p>
          </div>
          <div>
            <p className="mb-2"><strong>S&P 500:</strong> Índice bursátil que incluye las 500 empresas más grandes de EE.UU.</p>
            <p>Última actualización: {datosSp500 && new Date(datosSp500.timestamp).toLocaleString('es-ES')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mercados;
