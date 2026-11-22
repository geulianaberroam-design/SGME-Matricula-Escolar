package com.sgme.matricula.controlador;

import com.sgme.matricula.dto.EventoRequest;
import com.sgme.matricula.dto.EventoResponse;
import com.sgme.matricula.servicio.EventoServicio;
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

/** GET/POST/PUT/DELETE /api/eventos */
@RestController
@RequestMapping("/api/eventos")
public class EventoControlador {

    private final EventoServicio servicio;

    public EventoControlador(EventoServicio servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<EventoResponse> listar() {
        return servicio.listar();
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> registrar(@RequestBody EventoRequest datos) {
        EventoResponse creado = servicio.crear(datos);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "mensaje", "Evento registrado correctamente",
                "id", creado.id()));
    }

    @PutMapping("/{id}")
    public Map<String, Object> actualizar(@PathVariable("id") Integer id, @RequestBody EventoRequest datos) {
        servicio.actualizar(id, datos);
        return Map.of("mensaje", "Evento actualizado correctamente");
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> eliminar(@PathVariable("id") Integer id) {
        servicio.eliminar(id);
        return Map.of("mensaje", "Evento eliminado correctamente");
    }
}
