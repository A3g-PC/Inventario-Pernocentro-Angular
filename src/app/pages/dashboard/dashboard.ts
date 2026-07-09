import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { Sidebar } from '../../components/sidebar/sidebar';
import { AuthService } from '../../services/auth.service';
import { InventarioService } from '../../services/inventario.service';
import { UsuarioSistema } from '../../models/usuario-sistema.model';
import { Producto } from '../../models/producto.model';

@Component({
  selector: 'app-dashboard',
  imports: [Sidebar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  usuarioActual: UsuarioSistema | null = null;
  productos: Producto[] = [];
  cargando = true;
  mensajeError = '';

  constructor(
    private authService: AuthService,
    private inventarioService: InventarioService,
    private changeDetector: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.usuarioActual = this.authService.obtenerUsuarioActual();
    await this.cargarProductos();
  }

  async cargarProductos(): Promise<void> {
    this.cargando = true;
    this.mensajeError = '';
    this.changeDetector.detectChanges();

    try {
      this.productos = await this.inventarioService.obtenerProductos();
    } catch (error) {
      this.mensajeError = 'No se pudo cargar la información del inventario.';
      console.error('Error al cargar productos:', error);
    } finally {
      this.cargando = false;
      this.changeDetector.detectChanges();
    }
  }

  obtenerTotalProductos(): number {
    return this.productos.length;
  }

  obtenerTotalUnidades(): number {
    return this.productos.reduce((total, producto) => total + producto.cantidad, 0);
  }

  obtenerProductosBajoStock(): Producto[] {
    return this.productos.filter((producto) => producto.requiereReposicion());
  }

  obtenerProductosCriticos(): Producto[] {
    return this.productos.filter((producto) => producto.obtenerPrioridad() === 'Crítica');
  }
}