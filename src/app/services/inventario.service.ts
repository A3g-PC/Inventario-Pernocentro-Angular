import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocsFromServer,
  runTransaction,
  updateDoc
} from 'firebase/firestore';

import { db } from '../firebase/firebase.config';
import { Producto } from '../models/producto.model';
import { MovimientoInventario, TipoMovimiento } from '../models/movimiento-inventario.model';
import { UsuarioSistema } from '../models/usuario-sistema.model';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  async obtenerProductos(): Promise<Producto[]> {
    const referenciaProductos = collection(db, 'productos');
    const consulta = await getDocsFromServer(referenciaProductos);

    return consulta.docs.map((documento) => {
      const datos = documento.data();

      return new Producto(
        documento.id,
        datos['nombre'] ?? '',
        datos['categoria'] ?? '',
        Number(datos['cantidad'] ?? 0),
        Number(datos['stockMinimo'] ?? 0),
        datos['proveedorId'] ?? ''
      );
    });
  }

  async agregarProducto(producto: Omit<Producto, 'id'>): Promise<void> {
    await addDoc(collection(db, 'productos'), {
      nombre: producto.nombre,
      categoria: producto.categoria,
      cantidad: producto.cantidad,
      stockMinimo: producto.stockMinimo,
      proveedorId: producto.proveedorId
    });
  }

  async actualizarProducto(producto: Producto): Promise<void> {
    const referenciaProducto = doc(db, 'productos', producto.id);

    await updateDoc(referenciaProducto, {
      nombre: producto.nombre,
      categoria: producto.categoria,
      cantidad: producto.cantidad,
      stockMinimo: producto.stockMinimo,
      proveedorId: producto.proveedorId
    });
  }

  async eliminarProducto(productoId: string): Promise<void> {
    await deleteDoc(doc(db, 'productos', productoId));
  }

  async registrarMovimiento(
    productoId: string,
    tipo: TipoMovimiento,
    cantidad: number,
    motivo: string,
    usuario: UsuarioSistema
  ): Promise<void> {
    const referenciaProducto = doc(db, 'productos', productoId);
    const referenciaMovimiento = doc(collection(db, 'movimientos'));
    const referenciaHistorial = doc(collection(db, 'historial'));

    await runTransaction(db, async (transaccion) => {
      const documentoProducto = await transaccion.get(referenciaProducto);

      if (!documentoProducto.exists()) {
        throw new Error('El producto seleccionado no existe.');
      }

      const datos = documentoProducto.data();

      const producto = new Producto(
        documentoProducto.id,
        datos['nombre'] ?? '',
        datos['categoria'] ?? '',
        Number(datos['cantidad'] ?? 0),
        Number(datos['stockMinimo'] ?? 0),
        datos['proveedorId'] ?? ''
      );

      const movimiento = new MovimientoInventario(
        producto.id,
        producto.nombre,
        tipo,
        cantidad,
        producto.cantidad,
        motivo,
        usuario.uid,
        usuario.nombre,
        usuario.rol
      );

      if (!movimiento.validarMovimiento()) {
        throw new Error(movimiento.obtenerErrorValidacion());
      }

      const registro = movimiento.generarRegistro();

      transaccion.update(referenciaProducto, {
        cantidad: registro.stockNuevo
      });

      transaccion.set(referenciaMovimiento, registro);

      transaccion.set(referenciaHistorial, {
        tipo: 'Movimiento de inventario',
        descripcion: `Se registró una ${tipo} de ${cantidad} unidades en el producto ${producto.nombre}.`,
        usuarioId: usuario.uid,
        usuarioNombre: usuario.nombre,
        rolUsuario: usuario.rol,
        fecha: registro.fecha
      });
    });
  }

  async obtenerProductoPorId(productoId: string): Promise<Producto | null> {
    const referenciaProducto = doc(db, 'productos', productoId);
    const documento = await getDoc(referenciaProducto);

    if (!documento.exists()) {
      return null;
    }

    const datos = documento.data();

    return new Producto(
      documento.id,
      datos['nombre'] ?? '',
      datos['categoria'] ?? '',
      Number(datos['cantidad'] ?? 0),
      Number(datos['stockMinimo'] ?? 0),
      datos['proveedorId'] ?? ''
    );
  }
}