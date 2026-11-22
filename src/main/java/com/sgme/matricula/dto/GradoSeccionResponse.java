package com.sgme.matricula.dto;

import com.sgme.matricula.modelo.GradoSeccion;

public record GradoSeccionResponse(Integer id, String grado, String seccion) {

    public static GradoSeccionResponse desde(GradoSeccion g) {
        return new GradoSeccionResponse(g.getId(), g.getGrado(), g.getSeccion());
    }
}
