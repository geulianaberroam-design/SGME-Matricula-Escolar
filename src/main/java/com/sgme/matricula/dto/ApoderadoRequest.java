package com.sgme.matricula.dto;

/** Cuerpo de POST/PUT /api/apoderados. */
public record ApoderadoRequest(
        String dni,
        String nombres,
        String apellidos,
        String telefono,
        String email,
        String parentesco) {
}
