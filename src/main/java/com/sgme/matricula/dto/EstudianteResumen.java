package com.sgme.matricula.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sgme.matricula.modelo.Estudiante;

/** Datos mínimos del estudiante que se incrustan en matrículas, pagos y documentos. */
public record EstudianteResumen(
        Integer id,
        String dni,
        String nombres,
        String apellidos,
        @JsonProperty("id_apoderado") Integer idApoderado) {

    public static EstudianteResumen desde(Estudiante e) {
        return new EstudianteResumen(e.getId(), e.getDni(), e.getNombres(), e.getApellidos(),
                e.getApoderado().getId());
    }
}
