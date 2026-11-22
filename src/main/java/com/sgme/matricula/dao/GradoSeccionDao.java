package com.sgme.matricula.dao;

import com.sgme.matricula.modelo.GradoSeccion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GradoSeccionDao extends JpaRepository<GradoSeccion, Integer> {
    boolean existsByGradoAndSeccion(String grado, String seccion);

    boolean existsByGradoAndSeccionAndIdNot(String grado, String seccion, Integer id);
}
