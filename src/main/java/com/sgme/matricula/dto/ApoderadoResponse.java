package com.sgme.matricula.dto;

import com.sgme.matricula.modelo.Apoderado;
import com.sgme.matricula.util.Validar;

public record ApoderadoResponse(
        Integer id,
        String dni,
        String nombres,
        String apellidos,
        String telefono,
        String email,
        String parentesco) {

    public static ApoderadoResponse desde(Apoderado a) {
        return new ApoderadoResponse(a.getId(), a.getDni(), a.getNombres(), a.getApellidos(),
                Validar.vacioSiNull(a.getTelefono()), Validar.vacioSiNull(a.getEmail()),
                Validar.vacioSiNull(a.getParentesco()));
    }
}
