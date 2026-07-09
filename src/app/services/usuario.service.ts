import { Injectable } from '@angular/core';
import { collection, doc, getDocsFromServer, updateDoc } from 'firebase/firestore';

import { db } from '../firebase/firebase.config';
import { RolUsuario, UsuarioSistema } from '../models/usuario-sistema.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  async obtenerUsuarios(): Promise<UsuarioSistema[]> {
    const referenciaUsuarios = collection(db, 'usuarios');
    const consulta = await getDocsFromServer(referenciaUsuarios);

    return consulta.docs.map((documento) => {
      const datos = documento.data();

      return new UsuarioSistema(
        documento.id,
        datos['nombre'] ?? '',
        datos['email'] ?? '',
        datos['rol'] ?? 'Empleado',
        Boolean(datos['activo'])
      );
    });
  }

  async actualizarPerfilUsuario(
    uid: string,
    nombre: string,
    rol: RolUsuario,
    activo: boolean
  ): Promise<void> {
    await updateDoc(doc(db, 'usuarios', uid), {
      nombre,
      rol,
      activo
    });
  }

  async actualizarEstadoUsuario(uid: string, activo: boolean): Promise<void> {
    await updateDoc(doc(db, 'usuarios', uid), {
      activo
    });
  }

  async actualizarRolUsuario(uid: string, rol: RolUsuario): Promise<void> {
    await updateDoc(doc(db, 'usuarios', uid), {
      rol
    });
  }
}