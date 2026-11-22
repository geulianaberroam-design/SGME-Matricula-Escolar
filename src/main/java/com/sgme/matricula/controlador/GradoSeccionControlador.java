package com.sgme.matricula.controlador;

import com.sgme.matricula.dto.GradoSeccionRequest;
import com.sgme.matricula.dto.GradoSeccionResponse;
import com.sgme.matricula.servicio.GradoSeccionServicio;
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

/** GET/POST/PUT/DELETE /api/grados */
@RestController
@RequestMapping("/api/grados")
public class GradoSeccionControlador {

    private final GradoSeccionServicio servicio;

    public GradoSeccionControlador(GradoSeccionServicio servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<GradoSeccionResponse> listar() {
        return servicio.listar();
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> registrar(@RequestBody GradoSeccionRequest datos) {
        GradoSeccionResponse creado = servicio.crear(datos);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "mensaje", "Grado y sección registrados correctamente",
                "id", creado.id()));
    }

    @PutMapping("/{id}")
    public Map<String, Object> actualizar(@PathVariable("id") Integer id, @RequestBody GradoSeccionRequest datos) {
        servicio.actualizar(id, datos);
        return Map.of("mensaje", "Grado y sección actualizados correctamente");
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> eliminar(@PathVariable("id") Integer id) {
        servicio.eliminar(id);
        return Map.of("mensaje", "Grado y sección eliminados correctamente");
    }
}
