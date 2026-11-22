package com.sgme.matricula.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sgme.matricula.modelo.Matricula;
import java.time.LocalDate;

public record MatriculaResponse(
        Integer id,
        Integer anio,
        LocalDate fecha,
        String estado,
        EstudianteResumen estudiante,
        @JsonProperty("grado_seccion") GradoSeccionResponse gradoSeccion) {

    public static MatriculaResponse desde(Matricula m) {
        return new MatriculaResponse(m.getId(), m.getAnio(), m.getFecha(), m.getEstado(),
                EstudianteResumen.desde(m.getEstudiante()), GradoSeccionResponse.desde(m.getGradoSeccion()));
    }
}
