package com.sgme.matricula.excepcion;

/** El registro solicitado no existe (HTTP 404). */
public class NoEncontradoException extends RuntimeException {
    public NoEncontradoException(String mensaje) { super(mensaje); }
}
