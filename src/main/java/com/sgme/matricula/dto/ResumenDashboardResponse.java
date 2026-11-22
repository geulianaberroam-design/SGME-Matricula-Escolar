package com.sgme.matricula.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

/** Totales ya calculados en la base de datos para el Dashboard. */
public record ResumenDashboardResponse(
        @JsonProperty("total_estudiantes") long totalEstudiantes,
        @JsonProperty("total_apoderados") long totalApoderados,
        @JsonProperty("total_grados") long totalGrados,
        @JsonProperty("total_matriculas") long totalMatriculas,
        @JsonProperty("matriculas_activas") long matriculasActivas,
        @JsonProperty("matriculas_pendientes") long matriculasPendientes,
        @JsonProperty("estudiantes_matriculados") long estudiantesMatriculados,
        @JsonProperty("porcentaje_matriculados") int porcentajeMatriculados,
        @JsonProperty("total_pagos") long totalPagos,
        @JsonProperty("monto_cobrado") BigDecimal montoCobrado,
        @JsonProperty("pagos_parciales") long pagosParciales,
        @JsonProperty("pagos_anulados") long pagosAnulados,
        @JsonProperty("total_documentos") long totalDocumentos,
        @JsonProperty("documentos_pendientes") long documentosPendientes,
        @JsonProperty("documentos_observados") long documentosObservados,
        @JsonProperty("documentos_aprobados") long documentosAprobados,
        @JsonProperty("actualizado_en") String actualizadoEn) {
}
