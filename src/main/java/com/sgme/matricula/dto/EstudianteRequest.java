package com.sgme.matricula.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/** Cuerpo de POST/PUT /api/estudiantes. La fecha llega como texto AAAA-MM-DD. */
public record EstudianteRequest(
        String dni,
        String nombres,
        String apellidos,
        String telefono,
        String email,
        @JsonProperty("fecha_nac") String fechaNac,
        String direccion,
        @JsonProperty("id_apoderado") Integer idApoderado) {
}
