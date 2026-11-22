package com.sgme.matricula.servicio;

import com.sgme.matricula.dao.MatriculaDao;
import com.sgme.matricula.dao.PagoDao;
import com.sgme.matricula.dto.PagoRequest;
import com.sgme.matricula.dto.PagoResponse;
import com.sgme.matricula.excepcion.NegocioException;
import com.sgme.matricula.excepcion.NoEncontradoException;
import com.sgme.matricula.modelo.Matricula;
import com.sgme.matricula.modelo.Pago;
import com.sgme.matricula.util.Validar;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PagoServicio {

    public static final List<String> ESTADOS = List.of("Pagado", "Parcial", "Anulado");

    private static final Logger log = LoggerFactory.getLogger(PagoServicio.class);

    private final PagoDao pagoDao;
    private final MatriculaDao matriculaDao;

    public PagoServicio(PagoDao pagoDao, MatriculaDao matriculaDao) {
        this.pagoDao = pagoDao;
        this.matriculaDao = matriculaDao;
    }

    @Transactional(readOnly = true)
    public List<PagoResponse> listar() {
        return pagoDao.listarTodos().stream().map(PagoResponse::desde).toList();
    }

    public PagoResponse crear(PagoRequest r) {
        Pago p = new Pago();
        aplicar(p, r);
        p = pagoDao.save(p);
        log.info("Se registró pago ID {} para matrícula {}", p.getId(), p.getMatricula().getId());
        return PagoResponse.desde(pagoDao.buscarConDetalle(p.getId()).orElse(p));
    }

    public void actualizar(Integer id, PagoRequest r) {
        Pago p = pagoDao.findById(id).orElseThrow(() -> new NoEncontradoException("No se encontró el pago."));
        aplicar(p, r);
        log.info("Se actualizó el pago ID {}", id);
    }

    public void eliminar(Integer id) {
        Pago p = pagoDao.findById(id).orElseThrow(() -> new NoEncontradoException("No se encontró el pago."));
        pagoDao.delete(p);
        log.info("Se eliminó el pago ID {}", id);
    }

    private void aplicar(Pago p, PagoRequest r) {
        if (r.idMatricula() == null) {
            throw new NegocioException("Debe seleccionar una matrícula.");
        }
        Matricula m = matriculaDao.findById(r.idMatricula())
                .orElseThrow(() -> new NegocioException("La matrícula no existe."));
        if (r.monto() == null || r.monto().compareTo(BigDecimal.ZERO) <= 0) {
            throw new NegocioException("El monto debe ser mayor a 0.");
        }
        if (r.monto().compareTo(new BigDecimal("99999999.99")) > 0) {
            throw new NegocioException("El monto es demasiado grande.");
        }
        String concepto = Validar.opcional(r.concepto(), "concepto", 100);
        String metodo = Validar.opcional(r.metodoPago(), "método de pago", 50);
        p.setMatricula(m);
        p.setMonto(r.monto().setScale(2, RoundingMode.HALF_UP));
        p.setFecha(Validar.fechaOHoy(r.fecha(), "fecha"));
        p.setComprobante(Validar.opcional(r.comprobante(), "comprobante", 100));
        p.setConcepto(concepto != null ? concepto : "Matrícula");
        p.setMetodoPago(metodo != null ? metodo : "Efectivo");
        p.setEstado(Validar.opcion(r.estado(), ESTADOS, "Pagado", "estado"));
    }
}
