import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { collection, getDocsFromServer } from 'firebase/firestore';

import { Sidebar } from '../../components/sidebar/sidebar';
import { InventarioService } from '../../services/inventario.service';
import { AuthService } from '../../services/auth.service';
import { db } from '../../firebase/firebase.config';

import { Producto } from '../../models/producto.model';
import { TipoMovimiento } from '../../models/movimiento-inventario.model';

interface MovimientoVista {
  id: string;
  fecha: any;
  productoNombre: string;
  tipo: TipoMovimiento;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  usuarioNombre: string;
  motivo: string;
}

@Component({
  selector: 'app-movimientos',
  imports: [FormsModule, Sidebar],
  templateUrl: './movimientos.html',
  styleUrl: './movimientos.css'
})
export class Movimientos implements OnInit {
  productos: Producto[] = [];
  movimientos: MovimientoVista[] = [];

  productoId = '';
  tipoMovimiento: TipoMovimiento = 'entrada';
  cantidad = 1;
  motivo = '';

  cargando = true;
  guardando = false;
  mensajeError = '';
  mensajeExito = '';

  constructor(
    private inventarioService: InventarioService,
    private authService: AuthService,
    private changeDetector: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    await this.cargarDatos();
  }

  async cargarDatos(): Promise<void> {
    this.cargando = true;
    this.mensajeError = '';
    this.changeDetector.detectChanges();

    try {
      this.productos = await this.inventarioService.obtenerProductos();
      await this.cargarMovimientos();
    } catch (error) {
      this.mensajeError = 'No se pudo cargar la información de movimientos.';
      console.error(error);
    } finally {
      this.cargando = false;
      this.changeDetector.detectChanges();
    }
  }

  async cargarMovimientos(): Promise<void> {
    const referenciaMovimientos = collection(db, 'movimientos');
    const consulta = await getDocsFromServer(referenciaMovimientos);

    this.movimientos = consulta.docs
      .map((documento) => {
        const datos = documento.data();

        return {
          id: documento.id,
          fecha: datos['fecha'],
          productoNombre: datos['productoNombre'] ?? '',
          tipo: datos['tipo'] ?? 'entrada',
          cantidad: Number(datos['cantidad'] ?? 0),
          stockAnterior: Number(datos['stockAnterior'] ?? 0),
          stockNuevo: Number(datos['stockNuevo'] ?? 0),
          usuarioNombre: datos['usuarioNombre'] ?? '',
          motivo: datos['motivo'] ?? ''
        };
      })
      .sort((a, b) => this.obtenerTiempoFecha(b.fecha) - this.obtenerTiempoFecha(a.fecha));
  }

  obtenerTiempoFecha(fecha: any): number {
    if (!fecha) {
      return 0;
    }

    if (typeof fecha === 'string') {
      return new Date(fecha).getTime();
    }

    if (fecha.toDate) {
      return fecha.toDate().getTime();
    }

    if (fecha.seconds) {
      return fecha.seconds * 1000;
    }

    return new Date(fecha).getTime();
  }

  convertirFecha(fecha: any): Date | null {
    if (!fecha) {
      return null;
    }

    if (typeof fecha === 'string') {
      return new Date(fecha);
    }

    if (fecha.toDate) {
      return fecha.toDate();
    }

    if (fecha.seconds) {
      return new Date(fecha.seconds * 1000);
    }

    return new Date(fecha);
  }

  formatearFecha(fecha: any): string {
    const fechaConvertida = this.convertirFecha(fecha);

    if (!fechaConvertida || isNaN(fechaConvertida.getTime())) {
      return 'Fecha no válida';
    }

    const dia = String(fechaConvertida.getDate()).padStart(2, '0');
    const mes = String(fechaConvertida.getMonth() + 1).padStart(2, '0');
    const anio = fechaConvertida.getFullYear();

    const horas = String(fechaConvertida.getHours()).padStart(2, '0');
    const minutos = String(fechaConvertida.getMinutes()).padStart(2, '0');

    return `${dia}/${mes}/${anio}, ${horas}:${minutos}`;
  }

  formatearTipo(tipo: TipoMovimiento): string {
    if (tipo === 'entrada') {
      return 'Entrada';
    }

    if (tipo === 'salida') {
      return 'Salida';
    }

    return 'Ajuste';
  }

  obtenerClaseTipo(tipo: TipoMovimiento): string {
    if (tipo === 'entrada') {
      return 'tipo-entrada';
    }

    if (tipo === 'salida') {
      return 'tipo-salida';
    }

    return 'tipo-ajuste';
  }

  limpiarFormulario(): void {
    this.productoId = '';
    this.tipoMovimiento = 'entrada';
    this.cantidad = 1;
    this.motivo = '';
    this.mensajeError = '';
    this.mensajeExito = '';
  }

  async registrarMovimiento(): Promise<void> {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (this.productoId === '') {
      this.mensajeError = 'Seleccione un producto.';
      return;
    }

    if (Number(this.cantidad) <= 0) {
      this.mensajeError = 'La cantidad debe ser mayor que cero.';
      return;
    }

    if (this.motivo.trim().length < 4) {
      this.mensajeError = 'Ingrese un motivo claro para el movimiento.';
      return;
    }

    const usuarioActual = this.authService.obtenerUsuarioActual();

    if (!usuarioActual) {
      this.mensajeError = 'No se encontró el usuario actual.';
      return;
    }

    this.guardando = true;
    this.changeDetector.detectChanges();

    try {
      await this.inventarioService.registrarMovimiento(
        this.productoId,
        this.tipoMovimiento,
        Number(this.cantidad),
        this.motivo.trim(),
        usuarioActual
      );

      this.mensajeExito = 'Movimiento registrado correctamente.';
      this.limpiarFormulario();
      await this.cargarDatos();

    } catch (error) {
      this.mensajeError = 'No se pudo registrar el movimiento. Verifique el stock disponible.';
      console.error(error);
    } finally {
      this.guardando = false;
      this.changeDetector.detectChanges();
    }
  }
}