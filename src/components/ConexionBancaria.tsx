
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface PropsConexion {
  userId: string;
  onTransaccionesImportadas: (transacciones: any[]) => void;
}

const ConexionBancaria: React.FC<PropsConexion> = ({ userId, onTransaccionesImportadas }) => {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
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
    </div>
  );
};

export default ConexionBancaria;
