import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Sidebar } from '../../components/sidebar/sidebar';
import { InventarioService } from '../../services/inventario.service';
import { ProveedorService } from '../../services/proveedor.service';
import { AuthService } from '../../services/auth.service';

import { Producto } from '../../models/producto.model';
import { Proveedor } from '../../models/proveedor.model';

@Component({
  selector: 'app-inventario',
  imports: [FormsModule, Sidebar],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css'
})
export class Inventario implements OnInit {
  productos: Producto[] = [];
  proveedores: Proveedor[] = [];

  cargando = true;
  mensajeError = '';
  mensajeExito = '';

  filtroNombre = '';
  filtroCategoria = '';
  filtroPrioridad = '';

  mostrandoFormulario = false;
  productoEditando: Producto | null = null;

  nombre = '';
  categoria = '';
  cantidad = 0;
  stockMinimo = 0;
  proveedorId = '';

  constructor(
    private inventarioService: InventarioService,
    private proveedorService: ProveedorService,
    public authService: AuthService,
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
      this.proveedores = await this.proveedorService.obtenerProveedores();
    } catch (error) {
      this.mensajeError = 'No se pudo cargar la información del inventario.';
      console.error(error);
    } finally {
      this.cargando = false;
      this.changeDetector.detectChanges();
    }
  }

  async cargarProductos(): Promise<void> {
    this.cargando = true;
    this.mensajeError = '';
    this.changeDetector.detectChanges();

    try {
      this.productos = await this.inventarioService.obtenerProductos();
    } catch (error) {
      this.mensajeError = 'No se pudo cargar el inventario.';
      console.error(error);
    } finally {
      this.cargando = false;
      this.changeDetector.detectChanges();
    }
  }

  obtenerProveedoresActivos(): Proveedor[] {
    return this.proveedores.filter((proveedor) => proveedor.estado === 'Activo');
  }

  obtenerNombreProveedor(proveedorId: string): string {
    if (!proveedorId || proveedorId.trim() === '') {
      return 'Sin proveedor';
    }

    const proveedorEncontrado = this.proveedores.find(
      (proveedor) => proveedor.id === proveedorId
    );

    return proveedorEncontrado ? proveedorEncontrado.nombre : 'Proveedor no encontrado';
  }

  mostrarFormularioAgregar(): void {
    this.limpiarFormulario();
    this.mostrandoFormulario = true;
  }

  cancelarFormulario(): void {
    this.limpiarFormulario();
    this.mostrandoFormulario = false;
  }

  obtenerProductosFiltrados(): Producto[] {
    return this.productos.filter((producto) => {
      const coincideNombre = producto.nombre
        .toLowerCase()
        .includes(this.filtroNombre.toLowerCase());

      const coincideCategoria =
        this.filtroCategoria === '' || producto.categoria === this.filtroCategoria;

      const coincidePrioridad =
        this.filtroPrioridad === '' || producto.obtenerPrioridad() === this.filtroPrioridad;

      return coincideNombre && coincideCategoria && coincidePrioridad;
    });
  }

  obtenerCategorias(): string[] {
    return [...new Set(this.productos.map((producto) => producto.categoria))];
  }

  seleccionarProducto(producto: Producto): void {
    this.productoEditando = producto;
    this.nombre = producto.nombre;
    this.categoria = producto.categoria;
    this.cantidad = producto.cantidad;
    this.stockMinimo = producto.stockMinimo;
    this.proveedorId = producto.proveedorId;
    this.mostrandoFormulario = true;
  }

  limpiarFormulario(): void {
    this.productoEditando = null;
    this.nombre = '';
    this.categoria = '';
    this.cantidad = 0;
    this.stockMinimo = 0;
    this.proveedorId = '';
    this.mensajeError = '';
    this.mensajeExito = '';
  }

  async guardarProducto(): Promise<void> {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.productoEditando && !this.authService.tienePermiso('crearProducto')) {
      this.mensajeError = 'No tiene permisos para crear productos.';
      return;
    }

    if (this.productoEditando && !this.authService.tienePermiso('editarProducto')) {
      this.mensajeError = 'No tiene permisos para editar productos.';
      return;
    }

    if (this.nombre.trim() === '' || this.categoria.trim() === '') {
      this.mensajeError = 'El nombre y la categoría son obligatorios.';
      return;
    }

    if (Number(this.stockMinimo) <= 0) {
      this.mensajeError = 'El stock mínimo debe ser mayor que cero.';
      return;
    }

    if (Number(this.cantidad) < 0) {
      this.mensajeError = 'La cantidad no puede ser negativa.';
      return;
    }

    try {
      if (this.productoEditando) {
        const productoActualizado = new Producto(
          this.productoEditando.id,
          this.nombre.trim(),
          this.categoria.trim(),
          Number(this.cantidad),
          Number(this.stockMinimo),
          this.proveedorId
        );

        await this.inventarioService.actualizarProducto(productoActualizado);
        this.mensajeExito = 'Producto actualizado correctamente.';
      } else {
        const productoNuevo = new Producto(
          '',
          this.nombre.trim(),
          this.categoria.trim(),
          Number(this.cantidad),
          Number(this.stockMinimo),
          this.proveedorId
        );

        await this.inventarioService.agregarProducto(productoNuevo);
        this.mensajeExito = 'Producto agregado correctamente.';
      }

      this.mostrandoFormulario = false;
      this.limpiarFormulario();
      await this.cargarProductos();

    } catch (error) {
      this.mensajeError = 'No se pudo guardar el producto.';
      console.error(error);
    }
  }

  async eliminarProducto(producto: Producto): Promise<void> {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.authService.tienePermiso('eliminarProducto')) {
      this.mensajeError = 'No tiene permisos para eliminar productos.';
      return;
    }

    const confirmar = confirm(`¿Está seguro de eliminar ${producto.nombre}?`);

    if (!confirmar) {
      return;
    }

    try {
      await this.inventarioService.eliminarProducto(producto.id);
      this.mensajeExito = 'Producto eliminado correctamente.';
      await this.cargarProductos();
    } catch (error) {
      this.mensajeError = 'No se pudo eliminar el producto.';
      console.error(error);
    }
  }
}