export type EstadoProducto = 'Disponible' | 'Bajo stock' | 'Agotado';

export type PrioridadProducto = 'Crítica' | 'Alta' | 'Media' | 'Sin alerta';

export class Producto {
  constructor(
    public id: string,
    public nombre: string,
    public categoria: string,
    public cantidad: number,
    public stockMinimo: number,
    public proveedorId: string
  ) {}

  obtenerEstado(): EstadoProducto {
    if (this.cantidad <= 0) {
      return 'Agotado';
    }

    if (this.cantidad <= this.stockMinimo) {
      return 'Bajo stock';
    }

    return 'Disponible';
  }

  obtenerPrioridad(): PrioridadProducto {
    if (this.cantidad <= 0) {
      return 'Crítica';
    }

    const porcentajeStock = this.cantidad / this.stockMinimo;

    if (porcentajeStock <= 0.5) {
      return 'Alta';
    }

    if (porcentajeStock <= 1) {
      return 'Media';
    }

    return 'Sin alerta';
  }

  calcularReposicionSugerida(): number {
    if (this.cantidad > this.stockMinimo) {
      return 0;
    }

    const margenSeguridad = Math.ceil(this.stockMinimo * 0.25);
    return (this.stockMinimo - this.cantidad) + margenSeguridad;
  }

  requiereReposicion(): boolean {
    return this.cantidad <= this.stockMinimo;
  }
}