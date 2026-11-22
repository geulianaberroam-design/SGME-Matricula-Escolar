package com.sgme.matricula.dao;

import com.sgme.matricula.modelo.Apoderado;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApoderadoDao extends JpaRepository<Apoderado, Integer> {
    boolean existsByDni(String dni);
}
