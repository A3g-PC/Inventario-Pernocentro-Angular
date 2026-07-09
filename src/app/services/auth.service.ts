import { Injectable } from '@angular/core';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';

import { doc, getDoc } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';

import { auth, db } from '../firebase/firebase.config';
import { PermisoUsuario, UsuarioSistema } from '../models/usuario-sistema.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usuarioActualSubject = new BehaviorSubject<UsuarioSistema | null>(null);
  usuarioActual$ = this.usuarioActualSubject.asObservable();

  private inicializacionCompleta = false;
  private resolverInicializacion!: () => void;

  private inicializacionPromesa = new Promise<void>((resolve) => {
    this.resolverInicializacion = resolve;
  });

  constructor() {
    onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          await this.cargarPerfilUsuario(firebaseUser);
        } else {
          this.usuarioActualSubject.next(null);
        }
      } catch (error) {
        console.error('Error al inicializar usuario:', error);
        this.usuarioActualSubject.next(null);
      } finally {
        if (!this.inicializacionCompleta) {
          this.inicializacionCompleta = true;
          this.resolverInicializacion();
        }
      }
    });
  }

  async esperarInicializacion(): Promise<void> {
    return this.inicializacionPromesa;
  }

  async iniciarSesion(usuario: string, password: string): Promise<UsuarioSistema> {
    const usuarioLimpio = usuario.trim().toLowerCase();
    const emailTecnico = `${usuarioLimpio}@pernocentro.app`;

    const credencial = await signInWithEmailAndPassword(
      auth,
      emailTecnico,
      password
    );

    const usuarioSistema = await this.cargarPerfilUsuario(credencial.user);

    if (!usuarioSistema.estaActivo()) {
      await this.cerrarSesion();
      throw new Error('El usuario se encuentra desactivado.');
    }

    return usuarioSistema;
  }

  private async cargarPerfilUsuario(firebaseUser: User): Promise<UsuarioSistema> {
    const referenciaUsuario = doc(db, 'usuarios', firebaseUser.uid);
    const documentoUsuario = await getDoc(referenciaUsuario);

    if (!documentoUsuario.exists()) {
      await signOut(auth);
      throw new Error('El usuario no tiene perfil asignado en Firestore.');
    }

    const datos = documentoUsuario.data();

    const usuarioSistema = new UsuarioSistema(
      firebaseUser.uid,
      datos['nombre'],
      datos['email'],
      datos['rol'],
      datos['activo']
    );

    this.usuarioActualSubject.next(usuarioSistema);
    return usuarioSistema;
  }

  async cerrarSesion(): Promise<void> {
    await signOut(auth);
    this.usuarioActualSubject.next(null);
  }

  obtenerUsuarioActual(): UsuarioSistema | null {
    return this.usuarioActualSubject.value;
  }

  estaAutenticado(): boolean {
    return this.usuarioActualSubject.value !== null;
  }

  tienePermiso(permiso: PermisoUsuario): boolean {
    const usuario = this.obtenerUsuarioActual();
    return usuario ? usuario.tienePermiso(permiso) : false;
  }
}