package com.sgme.matricula.dto;

/** Cuerpo de POST/PUT /api/eventos. */
public record EventoRequest(String titulo, String descripcion, String fecha, String tipo, String estado) {
}
