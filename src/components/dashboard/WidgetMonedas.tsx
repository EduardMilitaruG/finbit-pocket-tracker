
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, DollarSign } from 'lucide-react';

interface DatosCripto {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}

interface TasasCambio {
  [key: string]: number;
}

const WidgetMonedas: React.FC = () => {
  const [datosCripto, setDatosCripto] = useState<DatosCripto[]>([]);
  const [tasasCambio, setTasasCambio] = useState<TasasCambio>({});
  const [estaCargando, setEstaCargando] = useState(true);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date>(new Date());

  const obtenerDatosCripto = async () => {
    try {
      const respuesta = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false'
      );
      const datos = await respuesta.json();
      setDatosCripto(datos);
    } catch (error) {
      console.error('Error obteniendo datos de cripto:', error);
    }
  };

  const obtenerTasasCambio = async () => {
    try {
      const respuesta = await fetch(
        'https://api.exchangerate-api.com/v4/latest/USD'
      );
      const datos = await respuesta.json();
      setTasasCambio(datos.rates);
    } catch (error) {
      console.error('Error obteniendo tasas de cambio:', error);
      // Fallback con tasas aproximadas
      setTasasCambio({
        EUR: 0.85,
        GBP: 0.73,
        JPY: 110,
        MXN: 20.5,
        CAD: 1.25
      });
    }
  };

  const actualizarDatos = async () => {
    setEstaCargando(true);
    await Promise.all([obtenerDatosCripto(), obtenerTasasCambio()]);
    setUltimaActualizacion(new Date());
    setEstaCargando(false);
  };

  useEffect(() => {
    actualizarDatos();
    
    // Actualizar cada 5 minutos
    const intervalo = setInterval(actualizarDatos, 5 * 60 * 1000);
    
    return () => clearInterval(intervalo);
  }, []);

  const formatearPrecio = (precio: number, moneda: string = 'USD') => {
    if (moneda === 'USD') {
      return `$${precio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return precio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  };

  const monedasPrincipales = ['EUR', 'GBP', 'JPY', 'MXN', 'CAD'];

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Mercados en Tiempo Real</h3>
        <button
          onClick={actualizarDatos}
          disabled={estaCargando}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${estaCargando ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sección de Criptomonedas */}
        <div>
          <h4 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Top Criptomonedas
          </h4>
          <div className="space-y-3">
            {datosCripto.map((crypto) => (
              <div key={crypto.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">{crypto.symbol.toUpperCase()}</div>
                  <div className="text-sm text-gray-500">{crypto.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-800">
                    {formatearPrecio(crypto.current_price)}
                  </div>
                  <div className={`text-sm flex items-center gap-1 ${
                    crypto.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {crypto.price_change_percentage_24h >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sección de Conversión de Monedas */}
        <div>
          <h4 className="text-lg font-medium text-gray-700 mb-4">
            Tasas de Cambio (USD)
          </h4>
          <div className="space-y-3">
            {monedasPrincipales.map((moneda) => (
              <div key={moneda} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-800">
                  1 USD = {moneda}
                </div>
                <div className="font-semibold text-gray-700">
                  {formatearPrecio(tasasCambio[moneda] || 0, moneda)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Última actualización: {ultimaActualizacion.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default WidgetMonedas;
