import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  usuario = '';
  password = '';
  mostrarPassword = false;

  cargando = false;
  mensajeError = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private changeDetector: ChangeDetectorRef
  ) {}

  alternarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  async ingresar(): Promise<void> {
    this.mensajeError = '';

    if (this.usuario.trim() === '' || this.password.trim() === '') {
      this.mensajeError = 'Ingrese usuario y contraseña.';
      this.changeDetector.detectChanges();
      return;
    }

    this.cargando = true;
    this.changeDetector.detectChanges();

    try {
      await this.authService.iniciarSesion(this.usuario.trim(), this.password);
      await this.router.navigate(['/dashboard']);

    } catch (error) {
      this.mensajeError = 'Usuario o contraseña incorrectos.';
      console.error('Error al iniciar sesión:', error);

    } finally {
      this.cargando = false;
      this.changeDetector.detectChanges();
    }
  }
}