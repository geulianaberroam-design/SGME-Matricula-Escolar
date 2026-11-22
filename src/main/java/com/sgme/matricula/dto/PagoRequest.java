package com.sgme.matricula.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

/** Cuerpo de POST/PUT /api/pagos. */
public record PagoRequest(
        @JsonProperty("id_matricula") Integer idMatricula,
        String fecha,
        BigDecimal monto,
        String comprobante,
        String concepto,
        @JsonProperty("metodo_pago") String metodoPago,
        String estado) {
}
