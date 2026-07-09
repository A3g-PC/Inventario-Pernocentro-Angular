import { Injectable } from '@angular/core';
import { collection, getDocsFromServer, query } from 'firebase/firestore';

import { db } from '../firebase/firebase.config';
import { RegistroMovimiento } from '../models/movimiento-inventario.model';

export interface RegistroHistorial {
  id: string;
  tipo: string;
  descripcion: string;
  usuarioId: string;
  usuarioNombre: string;
  rolUsuario: string;
  fecha: string;
}

@Injectable({
  providedIn: 'root'
})
export class HistorialService {

  async obtenerHistorial(): Promise<RegistroHistorial[]> {
    const referencia = collection(db, 'historial');
    const consulta = await getDocsFromServer(query(referencia));

    return consulta.docs.map((documento) => {
      const datos = documento.data();

      return {
        id: documento.id,
        tipo: datos['tipo'] ?? '',
        descripcion: datos['descripcion'] ?? '',
        usuarioId: datos['usuarioId'] ?? '',
        usuarioNombre: datos['usuarioNombre'] ?? '',
        rolUsuario: datos['rolUsuario'] ?? '',
        fecha: datos['fecha'] ?? ''
      };
    }).sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  async obtenerMovimientos(): Promise<RegistroMovimiento[]> {
    const referencia = collection(db, 'movimientos');
    const consulta = await getDocsFromServer(query(referencia));

    return consulta.docs.map((documento) => {
      const datos = documento.data();

      return {
        productoId: datos['productoId'] ?? '',
        productoNombre: datos['productoNombre'] ?? '',
        tipo: datos['tipo'],
        cantidad: Number(datos['cantidad'] ?? 0),
        stockAnterior: Number(datos['stockAnterior'] ?? 0),
        stockNuevo: Number(datos['stockNuevo'] ?? 0),
        motivo: datos['motivo'] ?? '',
        usuarioId: datos['usuarioId'] ?? '',
        usuarioNombre: datos['usuarioNombre'] ?? '',
        rolUsuario: datos['rolUsuario'] ?? '',
        fecha: datos['fecha'] ?? ''
      };
    }).sort((a, b) => b.fecha.localeCompare(a.fecha));
  }
}