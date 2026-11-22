package com.sgme.matricula.controlador;

import com.sgme.matricula.dto.ApoderadoRequest;
import com.sgme.matricula.dto.ApoderadoResponse;
import com.sgme.matricula.servicio.ApoderadoServicio;
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

/** GET/POST/PUT/DELETE /api/apoderados */
@RestController
@RequestMapping("/api/apoderados")
public class ApoderadoControlador {

    private final ApoderadoServicio servicio;

    public ApoderadoControlador(ApoderadoServicio servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<ApoderadoResponse> listar() {
        return servicio.listar();
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> registrar(@RequestBody ApoderadoRequest datos) {
        ApoderadoResponse creado = servicio.crear(datos);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "mensaje", "Apoderado registrado correctamente",
                "apoderado", creado));
    }

    @PutMapping("/{id}")
    public Map<String, Object> actualizar(@PathVariable("id") Integer id, @RequestBody ApoderadoRequest datos) {
        servicio.actualizar(id, datos);
        return Map.of("mensaje", "Apoderado actualizado correctamente");
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> eliminar(@PathVariable("id") Integer id) {
        servicio.eliminar(id);
        return Map.of("mensaje", "Apoderado eliminado correctamente");
    }
}
