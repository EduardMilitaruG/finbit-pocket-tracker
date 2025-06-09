
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

  async agregarTransaccion(
    idUsuario: string, 
    descripcion: string, 
    cantidad: number, 
    tipo: 'Ingreso' | 'Gasto',
    objetivoAhorroId?: string
  ) {
    return servicioDatos.agregarNuevaTransaccion(idUsuario, descripcion, cantidad, tipo, objetivoAhorroId);
  }

  async obtenerTransaccionesPorUsuario(idUsuario: string) {
    return servicioDatos.obtenerTransaccionesUsuario(idUsuario);
  }

  async obtenerTransaccionesPorObjetivo(idObjetivo: string) {
    return servicioDatos.obtenerTransaccionesPorObjetivo(idObjetivo);
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

  async calcularYActualizarMontoObjetivo(idObjetivo: string) {
    return servicioDatos.calcularYActualizarMontoObjetivo(idObjetivo);
  }
}

export const servicioSupabase = new ServicioSupabaseLegacy();
