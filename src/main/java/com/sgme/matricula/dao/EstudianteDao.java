package com.sgme.matricula.dao;

import com.sgme.matricula.modelo.Estudiante;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstudianteDao extends JpaRepository<Estudiante, Integer> {
    boolean existsByDni(String dni);

    boolean existsByDniAndIdNot(String dni, Integer id);

    boolean existsByApoderado_Id(Integer idApoderado);
}
