package com.sgme.matricula.dao;

import com.sgme.matricula.modelo.Matricula;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MatriculaDao extends JpaRepository<Matricula, Integer> {

    /** Matrículas con estudiante y grado/sección en una sola consulta (INNER JOIN, como en Python). */
    @Query("select m from Matricula m join fetch m.estudiante e join fetch m.gradoSeccion g order by m.id")
    List<Matricula> listarTodas();

    @Query("select m from Matricula m join fetch m.estudiante e join fetch m.gradoSeccion g where m.id = :id")
    Optional<Matricula> buscarConDetalle(@Param("id") Integer id);

    boolean existsByAnioAndEstudiante_Id(Integer anio, Integer idEstudiante);

    boolean existsByEstudiante_Id(Integer idEstudiante);

    boolean existsByGradoSeccion_Id(Integer idGradoSeccion);

    @Query("select count(m) from Matricula m where lower(m.estado) in :estados")
    long contarPorEstados(@Param("estados") Collection<String> estados);

    @Query("select count(distinct m.estudiante.id) from Matricula m where lower(m.estado) in :estados")
    long contarEstudiantesConEstados(@Param("estados") Collection<String> estados);
}
