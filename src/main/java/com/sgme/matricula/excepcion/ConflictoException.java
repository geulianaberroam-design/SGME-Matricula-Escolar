package com.sgme.matricula.excepcion;

/** Duplicado o registro relacionado con otros datos (HTTP 409). */
public class ConflictoException extends RuntimeException {
    public ConflictoException(String mensaje) { super(mensaje); }
}
