package com.sgme.matricula.controlador;

import com.sgme.matricula.dto.DocumentoRequest;
import com.sgme.matricula.dto.DocumentoResponse;
import com.sgme.matricula.servicio.DocumentoServicio;
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

/** GET/POST/PUT/DELETE /api/documentos */
@RestController
@RequestMapping("/api/documentos")
public class DocumentoControlador {

    private final DocumentoServicio servicio;

    public DocumentoControlador(DocumentoServicio servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<DocumentoResponse> listar() {
        return servicio.listar();
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> registrar(@RequestBody DocumentoRequest datos) {
        DocumentoResponse creado = servicio.crear(datos);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "mensaje", "Documento registrado correctamente",
                "id", creado.id()));
    }

    @PutMapping("/{id}")
    public Map<String, Object> actualizar(@PathVariable("id") Integer id, @RequestBody DocumentoRequest datos) {
        servicio.actualizar(id, datos);
        return Map.of("mensaje", "Documento actualizado correctamente");
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> eliminar(@PathVariable("id") Integer id) {
        servicio.eliminar(id);
        return Map.of("mensaje", "Documento eliminado correctamente");
    }
}
