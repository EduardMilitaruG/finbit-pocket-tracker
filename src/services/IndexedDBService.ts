
class ServicioIndexedDB {
  private nombreBD = 'FinBitDB';
  private version = 2; // Incrementamos la versión para evitar conflictos
  private bd: IDBDatabase | null = null;

  async inicializar(): Promise<void> {
    return new Promise((resolver, rechazar) => {
      // Primero intentamos eliminar la BD existente para evitar conflictos de versión
      const solicitudEliminacion = indexedDB.deleteDatabase(this.nombreBD);
      
      solicitudEliminacion.onsuccess = () => {
        console.log('Base de datos anterior eliminada exitosamente');
        this.crearBaseDatos(resolver, rechazar);
      };
      
      solicitudEliminacion.onerror = () => {
        console.log('No se pudo eliminar la BD anterior, intentando crear nueva');
        this.crearBaseDatos(resolver, rechazar);
      };
      
      solicitudEliminacion.onblocked = () => {
        console.log('Eliminación bloqueada, intentando crear nueva BD');
        this.crearBaseDatos(resolver, rechazar);
      };
    });
  }

  private crearBaseDatos(resolver: () => void, rechazar: (error: any) => void): void {
    const solicitud = indexedDB.open(this.nombreBD, this.version);

    solicitud.onerror = () => rechazar(solicitud.error);
    solicitud.onsuccess = () => {
      this.bd = solicitud.result;
      console.log('Base de datos inicializada correctamente');
      resolver();
    };

    solicitud.onupgradeneeded = (evento) => {
      console.log('Creando estructura de base de datos');
      const bd = (evento.target as IDBOpenDBRequest).result;

      if (!bd.objectStoreNames.contains('usuarios')) {
        const almacenUsuarios = bd.createObjectStore('usuarios', { keyPath: 'id', autoIncrement: true });
        almacenUsuarios.createIndex('nombreUsuario', 'nombreUsuario', { unique: true });
        console.log('Almacén de usuarios creado');
      }

      if (!bd.objectStoreNames.contains('transacciones')) {
        const almacenTransacciones = bd.createObjectStore('transacciones', { keyPath: 'id', autoIncrement: true });
        almacenTransacciones.createIndex('idUsuario', 'idUsuario', { unique: false });
        console.log('Almacén de transacciones creado');
      }

      if (!bd.objectStoreNames.contains('objetivosAhorro')) {
        const almacenObjetivos = bd.createObjectStore('objetivosAhorro', { keyPath: 'id', autoIncrement: true });
        almacenObjetivos.createIndex('idUsuario', 'idUsuario', { unique: false });
        console.log('Almacén de objetivos de ahorro creado');
      }
    };
  }

  private async asegurarBD(): Promise<IDBDatabase> {
    if (!this.bd) {
      await this.inicializar();
    }
    return this.bd!;
  }

  async agregarUsuario(nombreUsuario: string, contrasena: string): Promise<any> {
    const bd = await this.asegurarBD();
    return new Promise((resolver, rechazar) => {
      const transaccion = bd.transaction(['usuarios'], 'readwrite');
      const almacen = transaccion.objectStore('usuarios');
      
      const usuario = {
        nombreUsuario,
        contrasenaHash: contrasena,
        fechaCreacion: Date.now()
      };

      const solicitud = almacen.add(usuario);
      
      solicitud.onsuccess = () => {
        resolver({ ...usuario, id: solicitud.result });
      };
      
      solicitud.onerror = () => rechazar(solicitud.error);
    });
  }

  async obtenerUsuario(nombreUsuario: string, contrasena: string): Promise<any> {
    const bd = await this.asegurarBD();
    return new Promise((resolver, rechazar) => {
      const transaccion = bd.transaction(['usuarios'], 'readonly');
      const almacen = transaccion.objectStore('usuarios');
      const indice = almacen.index('nombreUsuario');
      
      const solicitud = indice.get(nombreUsuario);
      
      solicitud.onsuccess = () => {
        const usuario = solicitud.result;
        if (usuario && usuario.contrasenaHash === contrasena) {
          resolver({ id: usuario.id, username: usuario.nombreUsuario });
        } else {
          resolver(null);
        }
      };
      
      solicitud.onerror = () => rechazar(solicitud.error);
    });
  }

  async agregarTransaccion(idUsuario: number, descripcion: string, cantidad: number, tipo: 'Ingreso' | 'Gasto'): Promise<any> {
    const bd = await this.asegurarBD();
    return new Promise((resolver, rechazar) => {
      const transaccion = bd.transaction(['transacciones'], 'readwrite');
      const almacen = transaccion.objectStore('transacciones');
      
      const nuevaTransaccion = {
        idUsuario,
        descripcion,
        cantidad,
        tipo,
        fecha: Date.now()
      };

      const solicitud = almacen.add(nuevaTransaccion);
      
      solicitud.onsuccess = () => {
        resolver({ ...nuevaTransaccion, id: solicitud.result });
      };
      
      solicitud.onerror = () => rechazar(solicitud.error);
    });
  }

  async obtenerTransaccionesPorUsuario(idUsuario: number): Promise<any[]> {
    const bd = await this.asegurarBD();
    return new Promise((resolver, rechazar) => {
      const transaccion = bd.transaction(['transacciones'], 'readonly');
      const almacen = transaccion.objectStore('transacciones');
      const indice = almacen.index('idUsuario');
      
      const solicitud = indice.getAll(idUsuario);
      
      solicitud.onsuccess = () => {
        const transacciones = solicitud.result.map(t => ({
          id: t.id,
          description: t.descripcion,
          amount: t.cantidad,
          type: t.tipo,
          date: t.fecha
        }));
        resolver(transacciones);
      };
      
      solicitud.onerror = () => rechazar(solicitud.error);
    });
  }

  async agregarObjetivoAhorro(idUsuario: number, titulo: string, cantidadObjetivo: number, descripcion?: string, fechaLimite?: number): Promise<any> {
    const bd = await this.asegurarBD();
    return new Promise((resolver, rechazar) => {
      const transaccion = bd.transaction(['objetivosAhorro'], 'readwrite');
      const almacen = transaccion.objectStore('objetivosAhorro');
      
      const nuevoObjetivo = {
        idUsuario,
        titulo,
        cantidadObjetivo,
        cantidadActual: 0,
        descripcion,
        fechaLimite,
        fechaCreacion: Date.now()
      };

      const solicitud = almacen.add(nuevoObjetivo);
      
      solicitud.onsuccess = () => {
        resolver({ ...nuevoObjetivo, id: solicitud.result });
      };
      
      solicitud.onerror = () => rechazar(solicitud.error);
    });
  }

  async obtenerObjetivosAhorroPorUsuario(idUsuario: number): Promise<any[]> {
    const bd = await this.asegurarBD();
    return new Promise((resolver, rechazar) => {
      const transaccion = bd.transaction(['objetivosAhorro'], 'readonly');
      const almacen = transaccion.objectStore('objetivosAhorro');
      const indice = almacen.index('idUsuario');
      
      const solicitud = indice.getAll(idUsuario);
      
      solicitud.onsuccess = () => {
        const objetivos = solicitud.result.map(obj => ({
          id: obj.id,
          title: obj.titulo,
          targetAmount: obj.cantidadObjetivo,
          currentAmount: obj.cantidadActual,
          description: obj.descripcion,
          deadline: obj.fechaLimite
        }));
        resolver(objetivos);
      };
      
      solicitud.onerror = () => rechazar(solicitud.error);
    });
  }

  async actualizarCantidadObjetivoAhorro(idObjetivo: number, nuevaCantidad: number): Promise<void> {
    const bd = await this.asegurarBD();
    return new Promise((resolver, rechazar) => {
      const transaccion = bd.transaction(['objetivosAhorro'], 'readwrite');
      const almacen = transaccion.objectStore('objetivosAhorro');
      
      const solicitudObtener = almacen.get(idObjetivo);
      
      solicitudObtener.onsuccess = () => {
        const objetivo = solicitudObtener.result;
        if (objetivo) {
          objetivo.cantidadActual = nuevaCantidad;
          const solicitudActualizar = almacen.put(objetivo);
          
          solicitudActualizar.onsuccess = () => resolver();
          solicitudActualizar.onerror = () => rechazar(solicitudActualizar.error);
        } else {
          rechazar(new Error('Objetivo no encontrado'));
        }
      };
      
      solicitudObtener.onerror = () => rechazar(solicitudObtener.error);
    });
  }
}

export const indexedDBService = new ServicioIndexedDB();
