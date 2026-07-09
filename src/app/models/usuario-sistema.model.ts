export type RolUsuario = 'Administrador' | 'Empleado';

export type PermisoUsuario =
  | 'verInventario'
  | 'crearProducto'
  | 'editarProducto'
  | 'eliminarProducto'
  | 'gestionarProveedores'
  | 'registrarMovimiento'
  | 'verHistorial'
  | 'exportarCSV'
  | 'gestionarUsuarios';

export class UsuarioSistema {
  constructor(
    public uid: string,
    public nombre: string,
    public email: string,
    public rol: RolUsuario,
    public activo: boolean
  ) {}

  estaActivo(): boolean {
    return this.activo === true;
  }

  esAdministrador(): boolean {
    return this.rol === 'Administrador' && this.estaActivo();
  }

  esEmpleado(): boolean {
    return this.rol === 'Empleado' && this.estaActivo();
  }

  tienePermiso(permiso: PermisoUsuario): boolean {
    const permisosPorRol: Record<RolUsuario, PermisoUsuario[]> = {
      Administrador: [
        'verInventario',
        'crearProducto',
        'editarProducto',
        'eliminarProducto',
        'gestionarProveedores',
        'registrarMovimiento',
        'verHistorial',
        'exportarCSV',
        'gestionarUsuarios'
      ],
      Empleado: [
        'verInventario',
        'registrarMovimiento',
        'verHistorial',
        'exportarCSV'
      ]
    };

    return this.estaActivo() && permisosPorRol[this.rol].includes(permiso);
  }

  obtenerDescripcionRol(): string {
    if (this.esAdministrador()) {
      return 'Administrador con acceso completo al sistema';
    }

    if (this.esEmpleado()) {
      return 'Empleado con permisos limitados de operación';
    }

    return 'Usuario inactivo';
  }
}