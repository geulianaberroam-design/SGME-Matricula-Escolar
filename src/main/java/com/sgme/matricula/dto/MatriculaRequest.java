package com.sgme.matricula.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/** Cuerpo de POST /api/matriculas (y de PUT, donde solo se usa "estado"). */
public record MatriculaRequest(
        Integer anio,
        String fecha,
        String estado,
        @JsonProperty("id_estudiante") Integer idEstudiante,
        @JsonProperty("id_grado_seccion") Integer idGradoSeccion) {
}
