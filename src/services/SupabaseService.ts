
import { dataService } from './DataService';

// Legacy service that delegates to the new DataService
// This maintains compatibility with existing code
class LegacySupabaseService {
  async obtenerPerfil(userId: string) {
    return dataService.getUserProfile(userId);
  }

  async crearPerfil(userId: string, nombreUsuario: string) {
    return dataService.createUserProfile(userId, nombreUsuario);
  }

  async agregarTransaccion(userId: string, descripcion: string, cantidad: number, tipo: 'Ingreso' | 'Gasto') {
    return dataService.addNewTransaction(userId, descripcion, cantidad, tipo);
  }

  async obtenerTransaccionesPorUsuario(userId: string) {
    return dataService.fetchUserTransactions(userId);
  }

  async agregarObjetivoAhorro(
    userId: string, 
    titulo: string, 
    cantidadObjetivo: number, 
    descripcion?: string, 
    fechaLimite?: number
  ) {
    return dataService.createSavingsGoal(userId, titulo, cantidadObjetivo, descripcion, fechaLimite);
  }

  async obtenerObjetivosAhorroPorUsuario(userId: string) {
    return dataService.fetchUserSavingsGoals(userId);
  }

  async actualizarCantidadObjetivoAhorro(idObjetivo: string, nuevaCantidad: number) {
    return dataService.updateSavingsGoalAmount(idObjetivo, nuevaCantidad);
  }
}

export const supabaseService = new LegacySupabaseService();
