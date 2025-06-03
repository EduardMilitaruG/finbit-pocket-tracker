
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Bitcoin } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface PriceData {
  price: number;
  change24h: number;
  timestamp: number;
}

interface ChartData {
  time: string;
  price: number;
}

const Markets: React.FC = () => {
  const [bitcoinData, setBitcoinData] = useState<PriceData | null>(null);
  const [sp500Data, setSp500Data] = useState<PriceData | null>(null);
  const [bitcoinChart, setBitcoinChart] = useState<ChartData[]>([]);
  const [sp500Chart, setSp500Chart] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Generate mock chart data for demonstration
  const generateMockChartData = (basePrice: number, points: number = 24) => {
    const data: ChartData[] = [];
    let currentPrice = basePrice;
    
    for (let i = points; i >= 0; i--) {
      const time = new Date(Date.now() - i * 60 * 60 * 1000).toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      // Add some random variation
      const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
      currentPrice = currentPrice * (1 + variation);
      
      data.push({
        time,
        price: Math.round(currentPrice * 100) / 100
      });
    }
    
    return data;
  };

  const fetchMarketData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // For demonstration, we'll use mock data since we don't have API keys
      // In a real app, you would fetch from APIs like CoinGecko, Alpha Vantage, etc.
      
      const mockBitcoinPrice = 65000 + (Math.random() - 0.5) * 10000;
      const mockSp500Price = 4500 + (Math.random() - 0.5) * 500;
      
      setBitcoinData({
        price: mockBitcoinPrice,
        change24h: (Math.random() - 0.5) * 10, // Random change between -5% and +5%
        timestamp: Date.now()
      });
      
      setSp500Data({
        price: mockSp500Price,
        change24h: (Math.random() - 0.5) * 4, // Random change between -2% and +2%
        timestamp: Date.now()
      });
      
      setBitcoinChart(generateMockChartData(mockBitcoinPrice));
      setSp500Chart(generateMockChartData(mockSp500Price));
      
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError('Error al cargar los datos del mercado');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    
    // Update data every 5 minutes
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'EUR',
      minimumFractionDigits: currency === 'USD' ? 2 : 0,
      maximumFractionDigits: currency === 'USD' ? 2 : 0
    }).format(price);
  };

  const chartConfig = {
    price: {
      label: "Precio",
      color: "hsl(var(--chart-1))",
    },
  };

  if (isLoading) {
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
            onClick={fetchMarketData}
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
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
        <h3 className="text-2xl font-light text-gray-800 mb-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          Mercados Financieros
        </h3>
        <p className="text-gray-600 font-light">Seguimiento en tiempo real de Bitcoin y S&P 500</p>
      </div>

      {/* Price Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bitcoin Card */}
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
                {bitcoinData && formatPrice(bitcoinData.price, 'USD')}
              </p>
              {bitcoinData && (
                <div className={`flex items-center gap-1 justify-end ${
                  bitcoinData.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {bitcoinData.change24h >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {bitcoinData.change24h >= 0 ? '+' : ''}{bitcoinData.change24h.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Bitcoin Chart */}
          <div className="h-48">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bitcoinChart}>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>

        {/* S&P 500 Card */}
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
                {sp500Data && formatPrice(sp500Data.price, 'USD')}
              </p>
              {sp500Data && (
                <div className={`flex items-center gap-1 justify-end ${
                  sp500Data.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {sp500Data.change24h >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {sp500Data.change24h >= 0 ? '+' : ''}{sp500Data.change24h.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* S&P 500 Chart */}
          <div className="h-48">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sp500Chart}>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
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

      {/* Market Info */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
        <h4 className="text-xl font-light text-gray-800 mb-4">Información del Mercado</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
          <div>
            <p className="mb-2"><strong>Bitcoin:</strong> La primera y más conocida criptomoneda descentralizada.</p>
            <p>Última actualización: {bitcoinData && new Date(bitcoinData.timestamp).toLocaleString('es-ES')}</p>
          </div>
          <div>
            <p className="mb-2"><strong>S&P 500:</strong> Índice bursátil que incluye las 500 empresas más grandes de EE.UU.</p>
            <p>Última actualización: {sp500Data && new Date(sp500Data.timestamp).toLocaleString('es-ES')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Markets;
