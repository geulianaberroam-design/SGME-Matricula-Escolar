package com.sgme.matricula.dto;

import com.sgme.matricula.modelo.Evento;
import com.sgme.matricula.util.Validar;
import java.time.LocalDate;

public record EventoResponse(Integer id, String titulo, String descripcion, LocalDate fecha, String tipo, String estado) {

    public static EventoResponse desde(Evento e) {
        return new EventoResponse(e.getId(), e.getTitulo(), Validar.vacioSiNull(e.getDescripcion()), e.getFecha(),
                Validar.vacioSiNull(e.getTipo()), e.getEstado() != null ? e.getEstado() : "Activo");
    }
}
