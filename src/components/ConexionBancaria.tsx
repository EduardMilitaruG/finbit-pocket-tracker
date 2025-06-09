
import React, { useState } from 'react';
import { CreditCard, Building2, AlertCircle } from 'lucide-react';

interface ConexionBancariaProps {
  userId: string;
  onTransaccionesImportadas: (transacciones: any[]) => void;
}

const ConexionBancaria: React.FC<ConexionBancariaProps> = ({ userId, onTransaccionesImportadas }) => {
  const [conectando, setConectando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [bancoSeleccionado, setBancoSeleccionado] = useState('');

  const bancosEspana = [
    { id: 'SANTANDER_SANTEES_XXX', nombre: 'Banco Santander', logo: '🏦' },
    { id: 'BBVA_BBVAESMM_XXX', nombre: 'BBVA', logo: '💼' },
    { id: 'CAIXABANK_CAIXESBB_XXX', nombre: 'CaixaBank', logo: '🏛️' },
    { id: 'SABADELL_BSABESBB_XXX', nombre: 'Banco Sabadell', logo: '🏢' }
  ];

  const conectarBanco = async () => {
    if (!bancoSeleccionado) {
      setMensaje('Por favor selecciona un banco');
      return;
    }

    setConectando(true);
    setMensaje('');

    try {
      // Para el MVP, simulamos la conexión con datos de ejemplo
      // En producción, aquí iría la llamada real a la API de Nordigen
      
      // Simular delay de conexión
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generar transacciones de ejemplo
      const transaccionesEjemplo = [
        {
          descripcion: 'Nómina - Empresa ABC',
          cantidad: 2500,
          tipo: 'Ingreso',
          fecha: Date.now() - 86400000 * 2
        },
        {
          descripcion: 'Supermercado Mercadona',
          cantidad: 45.67,
          tipo: 'Gasto',
          fecha: Date.now() - 86400000 * 1
        },
        {
          descripcion: 'Gasolina Shell',
          cantidad: 60.50,
          tipo: 'Gasto',
          fecha: Date.now() - 86400000 * 3
        }
      ];

      onTransaccionesImportadas(transaccionesEjemplo);
      setMensaje('¡Conexión exitosa! Se han importado las transacciones recientes.');
      
    } catch (error) {
      console.error('Error conectando con el banco:', error);
      setMensaje('Error al conectar con el banco. Inténtalo de nuevo.');
    } finally {
      setConectando(false);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-4">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-light text-gray-800 mb-2">Conectar Cuenta Bancaria</h3>
        <p className="text-gray-600 font-light">Importa automáticamente tus transacciones</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Selecciona tu banco:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bancosEspana.map((banco) => (
              <button
                key={banco.id}
                onClick={() => setBancoSeleccionado(banco.id)}
                className={`p-4 border-2 rounded-2xl transition-all duration-200 ${
                  bancoSeleccionado === banco.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{banco.logo}</span>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">{banco.nombre}</p>
                    <p className="text-sm text-gray-500">Conexión segura</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Información importante</p>
              <p className="text-sm text-blue-700 mt-1">
                Esta es una demostración. En la versión real, se conectaría directamente con tu banco usando APIs seguras.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={conectarBanco}
          disabled={conectando || !bancoSeleccionado}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 px-6 rounded-2xl hover:from-green-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {conectando ? 'Conectando...' : 'Conectar Banco'}
        </button>

        {mensaje && (
          <div className={`p-4 rounded-2xl text-sm font-medium ${
            mensaje.includes('exitosa') 
              ? 'bg-green-100/80 text-green-700 border border-green-200' 
              : 'bg-red-100/80 text-red-700 border border-red-200'
          }`}>
            {mensaje}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConexionBancaria;
