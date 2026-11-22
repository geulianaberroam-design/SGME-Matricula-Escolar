package com.sgme.matricula.dao;

import com.sgme.matricula.modelo.Documento;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DocumentoDao extends JpaRepository<Documento, Integer> {

    @Query("select d from Documento d join fetch d.estudiante e order by d.id")
    List<Documento> listarTodos();

    @Query("select d from Documento d join fetch d.estudiante e where d.id = :id")
    Optional<Documento> buscarConDetalle(@Param("id") Integer id);

    boolean existsByEstudiante_Id(Integer idEstudiante);

    @Query("select count(d) from Documento d where lower(coalesce(d.estado, 'pendiente')) = :estado")
    long contarPorEstado(@Param("estado") String estado);
}
