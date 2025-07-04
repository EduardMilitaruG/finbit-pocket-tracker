
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const PaginaNoEncontrada = () => {
  const ubicacion = useLocation();

  useEffect(() => {
    console.error(
      "Error 404: Usuario intentó acceder a ruta inexistente:",
      ubicacion.pathname
    );
  }, [ubicacion.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">¡Oops! Página no encontrada</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Volver al Inicio
        </a>
      </div>
    </div>
  );
};

export default PaginaNoEncontrada;
