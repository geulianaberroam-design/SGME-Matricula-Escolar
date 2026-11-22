package com.sgme.matricula.dao;

import com.sgme.matricula.modelo.Evento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventoDao extends JpaRepository<Evento, Integer> {
}
