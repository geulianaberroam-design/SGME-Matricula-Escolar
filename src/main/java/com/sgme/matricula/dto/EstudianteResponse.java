package com.sgme.matricula.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sgme.matricula.modelo.Estudiante;
import com.sgme.matricula.util.Validar;
import java.time.LocalDate;

public record EstudianteResponse(
        Integer id,
        String dni,
        String nombres,
        String apellidos,
        String telefono,
        String email,
        @JsonProperty("fecha_nac") LocalDate fechaNac,
        String direccion,
        @JsonProperty("id_apoderado") Integer idApoderado) {

    public static EstudianteResponse desde(Estudiante e) {
        return new EstudianteResponse(e.getId(), e.getDni(), e.getNombres(), e.getApellidos(),
                Validar.vacioSiNull(e.getTelefono()), Validar.vacioSiNull(e.getEmail()),
                e.getFechaNac(), Validar.vacioSiNull(e.getDireccion()), e.getApoderado().getId());
    }
}
