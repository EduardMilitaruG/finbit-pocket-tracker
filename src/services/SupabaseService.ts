
import { servicioDatos } from './ServicioDatos';

// Servicio legacy que delega al nuevo ServicioDatos
// Esto mantiene compatibilidad con el código existente
class ServicioSupabaseLegacy {
  async obtenerPerfil(idUsuario: string) {
    return servicioDatos.obtenerPerfilUsuario(idUsuario);
  }

  async crearPerfil(idUsuario: string, nombreUsuario: string) {
    return servicioDatos.crearPerfilUsuario(idUsuario, nombreUsuario);
  }

  async agregarTransaccion(idUsuario: string, descripcion: string, cantidad: number, tipo: 'Ingreso' | 'Gasto') {
    return servicioDatos.agregarNuevaTransaccion(idUsuario, descripcion, cantidad, tipo);
  }

  async obtenerTransaccionesPorUsuario(idUsuario: string) {
    return servicioDatos.obtenerTransaccionesUsuario(idUsuario);
  }

  async agregarObjetivoAhorro(
    idUsuario: string, 
    titulo: string, 
    cantidadObjetivo: number, 
    descripcion?: string, 
    fechaLimite?: number
  ) {
    return servicioDatos.crearObjetivoAhorro(idUsuario, titulo, cantidadObjetivo, descripcion, fechaLimite);
  }

  async obtenerObjetivosAhorroPorUsuario(idUsuario: string) {
    return servicioDatos.obtenerObjetivosAhorroUsuario(idUsuario);
  }

  async actualizarCantidadObjetivoAhorro(idObjetivo: string, nuevaCantidad: number) {
    return servicioDatos.actualizarCantidadObjetivoAhorro(idObjetivo, nuevaCantidad);
  }
}

export const servicioSupabase = new ServicioSupabaseLegacy();
