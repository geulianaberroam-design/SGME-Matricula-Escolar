package com.sgme.matricula.excepcion;

import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.transaction.CannotCreateTransactionException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/**
 * Convierte cualquier error en un JSON {"mensaje": "...", "error": "..."}.
 * Así React siempre recibe el MOTIVO real del fallo (en Flask se perdía y solo
 * llegaba "No se pudo registrar ...").
 */
@RestControllerAdvice
public class ManejadorExcepciones {

    private static final Logger log = LoggerFactory.getLogger(ManejadorExcepciones.class);

    private ResponseEntity<Map<String, Object>> responder(HttpStatus estado, String mensaje, String detalle) {
        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("mensaje", mensaje);
        if (detalle != null) {
            cuerpo.put("error", detalle);
        }
        return ResponseEntity.status(estado).body(cuerpo);
    }

    @ExceptionHandler(NegocioException.class)
    public ResponseEntity<Map<String, Object>> negocio(NegocioException ex) {
        log.warn(ex.getMessage());
        return responder(HttpStatus.BAD_REQUEST, ex.getMessage(), null);
    }

    @ExceptionHandler(NoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> noEncontrado(NoEncontradoException ex) {
        log.warn(ex.getMessage());
        return responder(HttpStatus.NOT_FOUND, ex.getMessage(), null);
    }

    @ExceptionHandler(ConflictoException.class)
    public ResponseEntity<Map<String, Object>> conflicto(ConflictoException ex) {
        log.warn(ex.getMessage());
        return responder(HttpStatus.CONFLICT, ex.getMessage(), null);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> jsonInvalido(HttpMessageNotReadableException ex) {
        return responder(HttpStatus.BAD_REQUEST, "No se recibieron datos válidos (JSON vacío o mal formado).", null);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> tipoInvalido(MethodArgumentTypeMismatchException ex) {
        return responder(HttpStatus.BAD_REQUEST, "El valor '" + ex.getValue() + "' no es válido para '" + ex.getName() + "'.", null);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> integridad(DataIntegrityViolationException ex) {
        log.error("Violación de integridad en la base de datos", ex);
        return responder(HttpStatus.CONFLICT,
                "No se pudo completar la operación: el dato está duplicado o está relacionado con otros registros.",
                ex.getMostSpecificCause().getMessage());
    }

    @ExceptionHandler({CannotCreateTransactionException.class, DataAccessResourceFailureException.class})
    public ResponseEntity<Map<String, Object>> baseDeDatosCaida(Exception ex) {
        log.error("No hay conexión con PostgreSQL", ex);
        return responder(HttpStatus.SERVICE_UNAVAILABLE,
                "No se pudo conectar a PostgreSQL. Verifica que el servicio esté activo y las credenciales de application.properties.",
                ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> general(Exception ex) {
        // Errores propios de Spring MVC (404 de ruta, 405 de método...) conservan su código.
        if (ex instanceof ErrorResponse er) {
            return ResponseEntity.status(er.getStatusCode())
                    .body(Map.of("mensaje", "Solicitud no válida: " + ex.getMessage()));
        }
        log.error("Error inesperado", ex);
        return responder(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno del servidor.", ex.getMessage());
    }
}
