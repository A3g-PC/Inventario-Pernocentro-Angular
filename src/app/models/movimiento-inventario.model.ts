export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste';

export interface RegistroMovimiento {
  productoId: string;
  productoNombre: string;
  tipo: TipoMovimiento;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  motivo: string;
  usuarioId: string;
  usuarioNombre: string;
  rolUsuario: string;
  fecha: string;
}

export class MovimientoInventario {
  constructor(
    public productoId: string,
    public productoNombre: string,
    public tipo: TipoMovimiento,
    public cantidad: number,
    public stockAnterior: number,
    public motivo: string,
    public usuarioId: string,
    public usuarioNombre: string,
    public rolUsuario: string
  ) {}

  calcularStockNuevo(): number {
    if (this.tipo === 'entrada') {
      return this.stockAnterior + this.cantidad;
    }

    if (this.tipo === 'salida') {
      return this.stockAnterior - this.cantidad;
    }

    if (this.tipo === 'ajuste') {
      return this.cantidad;
    }

    return this.stockAnterior;
  }

  validarMovimiento(): boolean {
    if (this.cantidad <= 0) {
      return false;
    }

    if (this.motivo.trim() === '') {
      return false;
    }

    if (this.tipo === 'salida' && this.cantidad > this.stockAnterior) {
      return false;
    }

    return true;
  }

  obtenerErrorValidacion(): string {
    if (this.cantidad <= 0) {
      return 'La cantidad debe ser mayor que cero.';
    }

    if (this.motivo.trim() === '') {
      return 'El motivo del movimiento es obligatorio.';
    }

    if (this.tipo === 'salida' && this.cantidad > this.stockAnterior) {
      return 'No se puede registrar una salida mayor al stock disponible.';
    }

    return '';
  }

  generarRegistro(): RegistroMovimiento {
    return {
      productoId: this.productoId,
      productoNombre: this.productoNombre,
      tipo: this.tipo,
      cantidad: this.cantidad,
      stockAnterior: this.stockAnterior,
      stockNuevo: this.calcularStockNuevo(),
      motivo: this.motivo.trim(),
      usuarioId: this.usuarioId,
      usuarioNombre: this.usuarioNombre,
      rolUsuario: this.rolUsuario,
      fecha: new Date().toISOString()
    };
  }
}