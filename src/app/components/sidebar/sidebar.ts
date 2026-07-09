import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { UsuarioSistema } from '../../models/usuario-sistema.model';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit {
  usuarioActual: UsuarioSistema | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.authService.obtenerUsuarioActual();
  }

  esAdministrador(): boolean {
    return this.usuarioActual?.esAdministrador() ?? false;
  }

  async cerrarSesion(): Promise<void> {
    await this.authService.cerrarSesion();
    await this.router.navigate(['/login']);
  }
}