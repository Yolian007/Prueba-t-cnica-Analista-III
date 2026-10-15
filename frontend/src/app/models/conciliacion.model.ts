export interface ResultadoFactura {
  id_factura: string;
  nit_proveedor: string;
  fecha_factura: string;
  concepto: string;
  base_gravable: string;
  iva_reportado: string;
  iva_esperado: string;
  total_reportado: string;
  total_esperado: string;
  retencion_reportada: string;
  estado: 'Correcta' | 'Con inconsistencia';
  inconsistencias: string[];
}

export interface ResumenConciliacion {
  total_facturas: number;
  correctas: number;
  con_inconsistencia: number;
}

export interface RespuestaConciliacion {
  resumen: ResumenConciliacion;
  resultados: ResultadoFactura[];
}
