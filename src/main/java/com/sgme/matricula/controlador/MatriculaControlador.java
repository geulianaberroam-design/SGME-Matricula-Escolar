package com.sgme.matricula.controlador;

import com.sgme.matricula.dto.MatriculaRequest;
import com.sgme.matricula.dto.MatriculaResponse;
import com.sgme.matricula.servicio.MatriculaServicio;
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

/** GET/POST/PUT/DELETE /api/matriculas */
@RestController
@RequestMapping("/api/matriculas")
public class MatriculaControlador {

    private final MatriculaServicio servicio;

    public MatriculaControlador(MatriculaServicio servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<MatriculaResponse> listar() {
        return servicio.listar();
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> registrar(@RequestBody MatriculaRequest datos) {
        MatriculaResponse creado = servicio.crear(datos);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "mensaje", "Matrícula registrada correctamente",
                "id", creado.id()));
    }

    @PutMapping("/{id}")
    public Map<String, Object> actualizar(@PathVariable("id") Integer id, @RequestBody MatriculaRequest datos) {
        servicio.actualizar(id, datos);
        return Map.of("mensaje", "Matrícula actualizada correctamente");
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> eliminar(@PathVariable("id") Integer id) {
        servicio.eliminar(id);
        return Map.of("mensaje", "Matrícula eliminada correctamente");
    }
}
