export type EstadoProveedor = 'Activo' | 'Inactivo';

export class Proveedor {
  constructor(
    public id: string,
    public nombre: string,
    public telefono: string,
    public correo: string,
    public direccion: string,
    public productos: string,
    public estado: EstadoProveedor
  ) {}

  estaActivo(): boolean {
    return this.estado === 'Activo';
  }

  obtenerDescripcion(): string {
    return `${this.nombre} - ${this.productos}`;
  }
}