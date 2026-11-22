package com.sgme.matricula.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sgme.matricula.modelo.Pago;
import com.sgme.matricula.util.Validar;
import java.math.BigDecimal;
import java.time.LocalDate;

/** Pago con los datos del estudiante y su grado, listo para la tabla de React. */
public record PagoResponse(
        Integer id,
        LocalDate fecha,
        BigDecimal monto,
        String comprobante,
        String concepto,
        @JsonProperty("metodo_pago") String metodoPago,
        String estado,
        @JsonProperty("id_matricula") Integer idMatricula,
        EstudianteResumen estudiante,
        @JsonProperty("grado_seccion") GradoSeccionResponse gradoSeccion) {

    public static PagoResponse desde(Pago p) {
        return new PagoResponse(p.getId(), p.getFecha(), p.getMonto(),
                Validar.vacioSiNull(p.getComprobante()),
                p.getConcepto() != null ? p.getConcepto() : "Matrícula",
                p.getMetodoPago() != null ? p.getMetodoPago() : "Efectivo",
                p.getEstado() != null ? p.getEstado() : "Pagado",
                p.getMatricula().getId(),
                EstudianteResumen.desde(p.getMatricula().getEstudiante()),
                GradoSeccionResponse.desde(p.getMatricula().getGradoSeccion()));
    }
}
