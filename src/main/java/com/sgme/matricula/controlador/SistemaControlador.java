package com.sgme.matricula.controlador;

import com.sgme.matricula.config.SistemaConfig;
import com.sgme.matricula.dto.SistemaResponse;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SistemaControlador {

    private final SistemaConfig config;

    public SistemaControlador(SistemaConfig config) {
        this.config = config;
    }

    /** GET / : comprobación rápida de que la API está arriba (igual que en Flask). */
    @GetMapping("/")
    public Map<String, String> inicio() {
        return Map.of("mensaje", "API SGME funcionando correctamente");
    }

    /** GET /api/sistema : institución, año escolar y usuario que muestra la cabecera. */
    @GetMapping("/api/sistema")
    public SistemaResponse sistema() {
        return SistemaResponse.desde(config);
    }
}
