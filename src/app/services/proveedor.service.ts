import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocsFromServer,
  updateDoc
} from 'firebase/firestore';

import { db } from '../firebase/firebase.config';
import { Proveedor } from '../models/proveedor.model';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

  async obtenerProveedores(): Promise<Proveedor[]> {
    const referenciaProveedores = collection(db, 'proveedores');
    const consulta = await getDocsFromServer(referenciaProveedores);

    return consulta.docs.map((documento) => {
      const datos = documento.data();

      return new Proveedor(
        documento.id,
        datos['nombre'] ?? '',
        datos['telefono'] ?? '',
        datos['correo'] ?? '',
        datos['direccion'] ?? '',
        datos['productos'] ?? '',
        datos['estado'] ?? 'Activo'
      );
    });
  }

  async agregarProveedor(proveedor: Omit<Proveedor, 'id'>): Promise<void> {
    await addDoc(collection(db, 'proveedores'), {
      nombre: proveedor.nombre,
      telefono: proveedor.telefono,
      correo: proveedor.correo,
      direccion: proveedor.direccion,
      productos: proveedor.productos,
      estado: proveedor.estado
    });
  }

  async actualizarProveedor(proveedor: Proveedor): Promise<void> {
    await updateDoc(doc(db, 'proveedores', proveedor.id), {
      nombre: proveedor.nombre,
      telefono: proveedor.telefono,
      correo: proveedor.correo,
      direccion: proveedor.direccion,
      productos: proveedor.productos,
      estado: proveedor.estado
    });
  }

  async eliminarProveedor(proveedorId: string): Promise<void> {
    await deleteDoc(doc(db, 'proveedores', proveedorId));
  }
}