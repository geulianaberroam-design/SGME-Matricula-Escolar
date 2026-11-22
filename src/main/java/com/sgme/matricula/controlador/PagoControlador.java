package com.sgme.matricula.controlador;

import com.sgme.matricula.dto.PagoRequest;
import com.sgme.matricula.dto.PagoResponse;
import com.sgme.matricula.servicio.PagoServicio;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** GET/POST/PUT/DELETE /api/pagos */
@RestController
@RequestMapping("/api/pagos")
public class PagoControlador {

    private final PagoServicio servicio;

    public PagoControlador(PagoServicio servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<PagoResponse> listar() {
        return servicio.listar();
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> registrar(@RequestBody PagoRequest datos) {
        PagoResponse creado = servicio.crear(datos);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "mensaje", "Pago registrado correctamente",
                "id", creado.id()));
    }

    @PutMapping("/{id}")
    public Map<String, Object> actualizar(@PathVariable("id") Integer id, @RequestBody PagoRequest datos) {
        servicio.actualizar(id, datos);
        return Map.of("mensaje", "Pago actualizado correctamente");
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> eliminar(@PathVariable("id") Integer id) {
        servicio.eliminar(id);
        return Map.of("mensaje", "Pago eliminado correctamente");
    }
}
