package com.sgme.matricula.controlador;

import com.sgme.matricula.dto.ResumenDashboardResponse;
import com.sgme.matricula.servicio.DashboardServicio;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** GET /api/dashboard/resumen : totales en vivo para las tarjetas y notificaciones. */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardControlador {

    private final DashboardServicio servicio;

    public DashboardControlador(DashboardServicio servicio) {
        this.servicio = servicio;
    }

    @GetMapping("/resumen")
    public ResumenDashboardResponse resumen() {
        return servicio.resumen();
    }
}
