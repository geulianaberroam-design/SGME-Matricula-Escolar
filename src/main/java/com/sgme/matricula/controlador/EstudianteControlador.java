package com.sgme.matricula.controlador;

import com.sgme.matricula.dto.EstudianteRequest;
import com.sgme.matricula.dto.EstudianteResponse;
import com.sgme.matricula.servicio.EstudianteServicio;
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

/** GET/POST/PUT/DELETE /api/estudiantes */
@RestController
@RequestMapping("/api/estudiantes")
public class EstudianteControlador {

    private final EstudianteServicio servicio;

    public EstudianteControlador(EstudianteServicio servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<EstudianteResponse> listar() {
        return servicio.listar();
    }

    @GetMapping("/{id}")
    public EstudianteResponse obtener(@PathVariable("id") Integer id) {
        return servicio.obtener(id);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> registrar(@RequestBody EstudianteRequest datos) {
        EstudianteResponse creado = servicio.crear(datos);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "mensaje", "Estudiante registrado correctamente",
                "id", creado.id()));
    }

    @PutMapping("/{id}")
    public Map<String, Object> actualizar(@PathVariable("id") Integer id, @RequestBody EstudianteRequest datos) {
        servicio.actualizar(id, datos);
        return Map.of("mensaje", "Estudiante actualizado correctamente");
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> eliminar(@PathVariable("id") Integer id) {
        servicio.eliminar(id);
        return Map.of("mensaje", "Estudiante eliminado correctamente");
    }
}
