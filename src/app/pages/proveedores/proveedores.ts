import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Sidebar } from '../../components/sidebar/sidebar';
import { ProveedorService } from '../../services/proveedor.service';
import { EstadoProveedor, Proveedor } from '../../models/proveedor.model';

@Component({
  selector: 'app-proveedores',
  imports: [FormsModule, Sidebar],
  templateUrl: './proveedores.html',
  styleUrl: './proveedores.css'
})
export class Proveedores implements OnInit {
  proveedores: Proveedor[] = [];
  proveedorEditando: Proveedor | null = null;

  nombre = '';
  telefono = '';
  correo = '';
  direccion = '';
  productos = '';
  estado: EstadoProveedor = 'Activo';

  cargando = true;
  mensajeError = '';
  mensajeExito = '';

  constructor(
    private proveedorService: ProveedorService,
    private changeDetector: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    await this.cargarProveedores();
  }

  async cargarProveedores(): Promise<void> {
    this.cargando = true;
    this.mensajeError = '';
    this.changeDetector.detectChanges();

    try {
      this.proveedores = await this.proveedorService.obtenerProveedores();
    } catch (error) {
      this.mensajeError = 'No se pudieron cargar los proveedores.';
      console.error(error);
    } finally {
      this.cargando = false;
      this.changeDetector.detectChanges();
    }
  }

  seleccionarProveedor(proveedor: Proveedor): void {
    this.proveedorEditando = proveedor;
    this.nombre = proveedor.nombre;
    this.telefono = proveedor.telefono;
    this.correo = proveedor.correo;
    this.direccion = proveedor.direccion;
    this.productos = proveedor.productos;
    this.estado = proveedor.estado;
  }

  limpiarFormulario(): void {
    this.proveedorEditando = null;
    this.nombre = '';
    this.telefono = '';
    this.correo = '';
    this.direccion = '';
    this.productos = '';
    this.estado = 'Activo';
    this.mensajeError = '';
    this.mensajeExito = '';
  }

  async guardarProveedor(): Promise<void> {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (this.nombre.trim() === '') {
      this.mensajeError = 'El nombre del proveedor es obligatorio.';
      return;
    }

    if (this.telefono.trim() === '') {
      this.mensajeError = 'El teléfono del proveedor es obligatorio.';
      return;
    }

    try {
      if (this.proveedorEditando) {
        const proveedorActualizado = new Proveedor(
          this.proveedorEditando.id,
          this.nombre.trim(),
          this.telefono.trim(),
          this.correo.trim(),
          this.direccion.trim(),
          this.productos.trim(),
          this.estado
        );

        await this.proveedorService.actualizarProveedor(proveedorActualizado);
        this.mensajeExito = 'Proveedor actualizado correctamente.';
      } else {
        const proveedorNuevo = new Proveedor(
          '',
          this.nombre.trim(),
          this.telefono.trim(),
          this.correo.trim(),
          this.direccion.trim(),
          this.productos.trim(),
          this.estado
        );

        await this.proveedorService.agregarProveedor(proveedorNuevo);
        this.mensajeExito = 'Proveedor agregado correctamente.';
      }

      this.limpiarFormulario();
      await this.cargarProveedores();

    } catch (error) {
      this.mensajeError = 'No se pudo guardar el proveedor.';
      console.error(error);
    }
  }

  async eliminarProveedor(proveedor: Proveedor): Promise<void> {
    this.mensajeError = '';
    this.mensajeExito = '';

    const confirmar = confirm(`¿Está seguro de eliminar ${proveedor.nombre}?`);

    if (!confirmar) {
      return;
    }

    try {
      await this.proveedorService.eliminarProveedor(proveedor.id);
      this.mensajeExito = 'Proveedor eliminado correctamente.';
      await this.cargarProveedores();
    } catch (error) {
      this.mensajeError = 'No se pudo eliminar el proveedor.';
      console.error(error);
    }
  }
}