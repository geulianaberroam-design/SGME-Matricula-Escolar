package com.sgme.matricula.dao;

import com.sgme.matricula.modelo.Pago;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PagoDao extends JpaRepository<Pago, Integer> {

    @Query("select p from Pago p join fetch p.matricula m join fetch m.estudiante e join fetch m.gradoSeccion g order by p.id")
    List<Pago> listarTodos();

    @Query("select p from Pago p join fetch p.matricula m join fetch m.estudiante e join fetch m.gradoSeccion g where p.id = :id")
    Optional<Pago> buscarConDetalle(@Param("id") Integer id);

    boolean existsByMatricula_Id(Integer idMatricula);

    /** Suma de lo cobrado: todos los pagos excepto los anulados (los antiguos sin estado cuentan como pagados). */
    @Query("select coalesce(sum(p.monto), 0) from Pago p where lower(coalesce(p.estado, 'pagado')) <> 'anulado'")
    BigDecimal sumarCobrado();

    @Query("select count(p) from Pago p where lower(coalesce(p.estado, 'pagado')) = :estado")
    long contarPorEstado(@Param("estado") String estado);
}
