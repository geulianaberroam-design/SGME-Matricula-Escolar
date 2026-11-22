package com.sgme.matricula.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sgme.matricula.modelo.Documento;
import com.sgme.matricula.util.Validar;
import java.time.LocalDate;

public record DocumentoResponse(
        Integer id,
        String nombre,
        String tipo,
        String ruta,
        String estado,
        @JsonProperty("fecha_registro") LocalDate fechaRegistro,
        @JsonProperty("id_estudiante") Integer idEstudiante,
        EstudianteResumen estudiante) {

    public static DocumentoResponse desde(Documento d) {
        return new DocumentoResponse(d.getId(), d.getNombre(), d.getTipo(), Validar.vacioSiNull(d.getRuta()),
                d.getEstado() != null ? d.getEstado() : "Pendiente", d.getFechaRegistro(),
                d.getEstudiante().getId(), EstudianteResumen.desde(d.getEstudiante()));
    }
}
