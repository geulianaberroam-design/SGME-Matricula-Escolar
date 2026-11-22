package com.sgme.matricula.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/** Cuerpo de POST/PUT /api/documentos. */
public record DocumentoRequest(
        @JsonProperty("id_estudiante") Integer idEstudiante,
        String nombre,
        String tipo,
        String ruta,
        String estado,
        @JsonProperty("fecha_registro") String fechaRegistro) {
}
