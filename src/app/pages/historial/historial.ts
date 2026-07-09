import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { collection, getDocsFromServer } from 'firebase/firestore';

import { Sidebar } from '../../components/sidebar/sidebar';
import { db } from '../../firebase/firebase.config';

interface HistorialVista {
  id: string;
  fecha: any;
  tipo: string;
  descripcion: string;
  usuarioNombre: string;
  rolUsuario: string;
}

@Component({
  selector: 'app-historial',
  imports: [Sidebar],
  templateUrl: './historial.html',
  styleUrl: './historial.css'
})
export class Historial implements OnInit {
  registros: HistorialVista[] = [];

  cargando = true;
  mensajeError = '';

  constructor(private changeDetector: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    await this.cargarHistorial();
  }

  async cargarHistorial(): Promise<void> {
    this.cargando = true;
    this.mensajeError = '';
    this.changeDetector.detectChanges();

    try {
      const referenciaHistorial = collection(db, 'historial');
      const consulta = await getDocsFromServer(referenciaHistorial);

      this.registros = consulta.docs
        .map((documento) => {
          const datos = documento.data();

          return {
            id: documento.id,
            fecha: datos['fecha'],
            tipo: datos['tipo'] ?? '',
            descripcion: datos['descripcion'] ?? '',
            usuarioNombre: datos['usuarioNombre'] ?? '',
            rolUsuario: datos['rolUsuario'] ?? ''
          };
        })
        .sort((a, b) => this.obtenerTiempoFecha(b.fecha) - this.obtenerTiempoFecha(a.fecha));

    } catch (error) {
      this.mensajeError = 'No se pudo cargar el historial.';
      console.error(error);
    } finally {
      this.cargando = false;
      this.changeDetector.detectChanges();
    }
  }

  obtenerTiempoFecha(fecha: any): number {
    if (!fecha) {
      return 0;
    }

    if (typeof fecha === 'string') {
      return new Date(fecha).getTime();
    }

    if (fecha.toDate) {
      return fecha.toDate().getTime();
    }

    if (fecha.seconds) {
      return fecha.seconds * 1000;
    }

    return new Date(fecha).getTime();
  }

  convertirFecha(fecha: any): Date | null {
    if (!fecha) {
      return null;
    }

    if (typeof fecha === 'string') {
      return new Date(fecha);
    }

    if (fecha.toDate) {
      return fecha.toDate();
    }

    if (fecha.seconds) {
      return new Date(fecha.seconds * 1000);
    }

    return new Date(fecha);
  }

  formatearFecha(fecha: any): string {
    const fechaConvertida = this.convertirFecha(fecha);

    if (!fechaConvertida || isNaN(fechaConvertida.getTime())) {
      return 'Fecha no válida';
    }

    const dia = String(fechaConvertida.getDate()).padStart(2, '0');
    const mes = String(fechaConvertida.getMonth() + 1).padStart(2, '0');
    const anio = fechaConvertida.getFullYear();

    const horas = String(fechaConvertida.getHours()).padStart(2, '0');
    const minutos = String(fechaConvertida.getMinutes()).padStart(2, '0');

    return `${dia}/${mes}/${anio}, ${horas}:${minutos}`;
  }
}