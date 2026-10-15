import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ConciliacionService } from './services/conciliacion.service';
import { RespuestaConciliacion, ResultadoFactura } from './models/conciliacion.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  facturasFile: File | null = null;
  contabilidadFile: File | null = null;
  cargando = false;
  mensajeError: string | null = null;
  resultados: RespuestaConciliacion | null = null;
  filtroActual: string = 'Todos';
  resultadosFiltrados: ResultadoFactura[] = [];

  constructor(private conciliacionService: ConciliacionService) {}

  onFacturasSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.facturasFile = input.files[0];
      this.mensajeError = null;
    }
  }

  onContabilidadSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.contabilidadFile = input.files[0];
      this.mensajeError = null;
    }
  }

  procesarArchivos(): void {
    if (!this.facturasFile || !this.contabilidadFile) {
      this.mensajeError = 'Debe seleccionar ambos archivos antes de procesar.';
      return;
    }

    this.cargando = true;
    this.mensajeError = null;
    this.resultados = null;

    this.conciliacionService.procesarArchivos(this.facturasFile, this.contabilidadFile)
      .subscribe({
        next: (resp) => {
          this.resultados = resp;
          this.filtroActual = 'Todos';
          this.aplicarFiltro();
          this.cargando = false;
        },
        error: (err) => {
          this.cargando = false;
          if (err.error && err.error.detalle) {
            this.mensajeError = err.error.detalle;
          } else if (err.error && typeof err.error === 'object' && err.error.detail) {
            this.mensajeError = err.error.detail;
          } else if (err.status === 0) {
            this.mensajeError = 'No se pudo conectar con el servidor. Verifique que el backend esté en ejecución.';
          } else {
            this.mensajeError = 'Error al procesar los archivos. Intente de nuevo.';
          }
        }
      });
  }

  onFiltroChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filtroActual = select.value;
    this.aplicarFiltro();
  }

  private aplicarFiltro(): void {
    if (!this.resultados) {
      this.resultadosFiltrados = [];
      return;
    }

    if (this.filtroActual === 'Todos') {
      this.resultadosFiltrados = this.resultados.resultados;
    } else {
      this.resultadosFiltrados = this.resultados.resultados.filter(
        r => r.estado === this.filtroActual
      );
    }
  }

  formatearNumero(valor: string): string {
    if (!valor) return '—';
    const num = parseFloat(valor);
    if (isNaN(num)) return valor;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(num);
  }
}
