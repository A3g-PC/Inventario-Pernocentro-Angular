import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Sidebar } from '../../components/sidebar/sidebar';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { UsuarioSistema } from '../../models/usuario-sistema.model';

@Component({
  selector: 'app-usuarios',
  imports: [FormsModule, Sidebar],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class Usuarios implements OnInit {
  usuarios: UsuarioSistema[] = [];

  cargando = true;
  mensajeError = '';
  mensajeExito = '';

  usuarioEditando: UsuarioSistema | null = null;
  nombreEditado = '';
  activoEditado = true;

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private changeDetector: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    await this.cargarUsuarios();
  }

  async cargarUsuarios(): Promise<void> {
    this.cargando = true;
    this.mensajeError = '';
    this.mensajeExito = '';
    this.changeDetector.detectChanges();

    try {
      this.usuarios = await this.usuarioService.obtenerUsuarios();
    } catch (error) {
      this.mensajeError = 'No se pudieron cargar los usuarios.';
      console.error(error);
    } finally {
      this.cargando = false;
      this.changeDetector.detectChanges();
    }
  }

  editarUsuario(usuario: UsuarioSistema): void {
    this.usuarioEditando = usuario;
    this.nombreEditado = usuario.nombre;
    this.activoEditado = usuario.activo;
    this.mensajeError = '';
    this.mensajeExito = '';
  }

  cancelarEdicion(): void {
    this.usuarioEditando = null;
    this.nombreEditado = '';
    this.activoEditado = true;
    this.mensajeError = '';
  }

  async guardarCambiosUsuario(): Promise<void> {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.usuarioEditando) {
      this.mensajeError = 'No hay un usuario seleccionado para editar.';
      return;
    }

    if (this.nombreEditado.trim() === '') {
      this.mensajeError = 'El nombre del usuario es obligatorio.';
      return;
    }

    const usuarioActual = this.authService.obtenerUsuarioActual();

    if (usuarioActual && usuarioActual.uid === this.usuarioEditando.uid && !this.activoEditado) {
      this.mensajeError = 'No puedes desactivar tu propia cuenta mientras la estás usando.';
      return;
    }

    if (this.usuarioEditando.esAdministrador() && !this.activoEditado) {
      this.mensajeError = 'No se puede desactivar una cuenta de administrador desde este panel.';
      return;
    }

    try {
      await this.usuarioService.actualizarPerfilUsuario(
        this.usuarioEditando.uid,
        this.nombreEditado.trim(),
        this.usuarioEditando.rol,
        this.usuarioEditando.esAdministrador() ? true : this.activoEditado
      );

      this.mensajeExito = 'Usuario actualizado correctamente.';
      this.cancelarEdicion();
      await this.cargarUsuarios();

    } catch (error) {
      this.mensajeError = 'No se pudo actualizar el usuario.';
      console.error(error);
    }
  }

  async cambiarEstado(usuario: UsuarioSistema): Promise<void> {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (usuario.esAdministrador()) {
      this.mensajeError = 'No se puede desactivar una cuenta de administrador desde este panel.';
      return;
    }

    const usuarioActual = this.authService.obtenerUsuarioActual();

    if (usuarioActual && usuarioActual.uid === usuario.uid && usuario.activo) {
      this.mensajeError = 'No puedes desactivar tu propia cuenta mientras la estás usando.';
      return;
    }

    try {
      await this.usuarioService.actualizarEstadoUsuario(usuario.uid, !usuario.activo);
      this.mensajeExito = 'Estado del usuario actualizado.';
      await this.cargarUsuarios();
    } catch (error) {
      this.mensajeError = 'No se pudo actualizar el estado del usuario.';
      console.error(error);
    }
  }
}