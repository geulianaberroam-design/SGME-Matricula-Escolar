package com.sgme.matricula.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sgme.matricula.config.SistemaConfig;

public record SistemaResponse(
        String nombre,
        String version,
        String institucion,
        @JsonProperty("anio_escolar") int anioEscolar,
        String moneda,
        Usuario usuario) {

    public record Usuario(String nombre, String cargo) {
    }

    public static SistemaResponse desde(SistemaConfig c) {
        return new SistemaResponse(c.getNombreSistema(), c.getVersion(), c.getInstitucion(), c.getAnioEscolar(),
                c.getMoneda(), new Usuario(c.getUsuario().getNombre(), c.getUsuario().getCargo()));
    }
}
