package com.sgme.matricula.servicio;

import com.sgme.matricula.dao.ApoderadoDao;
import com.sgme.matricula.dao.DocumentoDao;
import com.sgme.matricula.dao.EstudianteDao;
import com.sgme.matricula.dao.GradoSeccionDao;
import com.sgme.matricula.dao.MatriculaDao;
import com.sgme.matricula.dao.PagoDao;
import com.sgme.matricula.dto.ResumenDashboardResponse;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Calcula en la base de datos los totales del Dashboard (una sola llamada para React). */
@Service
@Transactional(readOnly = true)
public class DashboardServicio {

    /** Estados que cuentan como matrícula vigente (en minúsculas). */
    public static final List<String> ESTADOS_ACTIVOS = List.of("matriculado", "activo", "activa", "aprobada", "aprobado");

    private final EstudianteDao estudianteDao;
    private final ApoderadoDao apoderadoDao;
    private final GradoSeccionDao gradoDao;
    private final MatriculaDao matriculaDao;
    private final PagoDao pagoDao;
    private final DocumentoDao documentoDao;

    public DashboardServicio(EstudianteDao estudianteDao, ApoderadoDao apoderadoDao, GradoSeccionDao gradoDao,
                             MatriculaDao matriculaDao, PagoDao pagoDao, DocumentoDao documentoDao) {
        this.estudianteDao = estudianteDao;
        this.apoderadoDao = apoderadoDao;
        this.gradoDao = gradoDao;
        this.matriculaDao = matriculaDao;
        this.pagoDao = pagoDao;
        this.documentoDao = documentoDao;
    }

    public ResumenDashboardResponse resumen() {
        long estudiantes = estudianteDao.count();
        long matriculados = matriculaDao.contarEstudiantesConEstados(ESTADOS_ACTIVOS);
        int porcentaje = estudiantes > 0 ? (int) Math.round(matriculados * 100.0 / estudiantes) : 0;

        return new ResumenDashboardResponse(
                estudiantes,
                apoderadoDao.count(),
                gradoDao.count(),
                matriculaDao.count(),
                matriculaDao.contarPorEstados(ESTADOS_ACTIVOS),
                matriculaDao.contarPorEstados(List.of("pendiente")),
                matriculados,
                porcentaje,
                pagoDao.count(),
                pagoDao.sumarCobrado(),
                pagoDao.contarPorEstado("parcial"),
                pagoDao.contarPorEstado("anulado"),
                documentoDao.count(),
                documentoDao.contarPorEstado("pendiente"),
                documentoDao.contarPorEstado("observación") + documentoDao.contarPorEstado("rechazado"),
                documentoDao.contarPorEstado("aprobado"),
                LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS).toString());
    }
}
