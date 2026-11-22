package com.sgme.matricula.excepcion;

/** Datos inválidos o regla de negocio incumplida (HTTP 400). */
public class NegocioException extends RuntimeException {
    public NegocioException(String mensaje) { super(mensaje); }
}
