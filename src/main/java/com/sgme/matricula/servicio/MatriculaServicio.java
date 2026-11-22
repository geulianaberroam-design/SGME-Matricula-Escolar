package com.sgme.matricula.servicio;

import com.sgme.matricula.dao.EstudianteDao;
import com.sgme.matricula.dao.GradoSeccionDao;
import com.sgme.matricula.dao.MatriculaDao;
import com.sgme.matricula.dao.PagoDao;
import com.sgme.matricula.dto.MatriculaRequest;
import com.sgme.matricula.dto.MatriculaResponse;
import com.sgme.matricula.excepcion.ConflictoException;
import com.sgme.matricula.excepcion.NegocioException;
import com.sgme.matricula.excepcion.NoEncontradoException;
import com.sgme.matricula.modelo.Estudiante;
import com.sgme.matricula.modelo.GradoSeccion;
import com.sgme.matricula.modelo.Matricula;
import com.sgme.matricula.util.Validar;
import java.time.Year;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MatriculaServicio {

    private static final Logger log = LoggerFactory.getLogger(MatriculaServicio.class);

    private final MatriculaDao matriculaDao;
    private final EstudianteDao estudianteDao;
    private final GradoSeccionDao gradoDao;
    private final PagoDao pagoDao;

    public MatriculaServicio(MatriculaDao matriculaDao, EstudianteDao estudianteDao,
                             GradoSeccionDao gradoDao, PagoDao pagoDao) {
        this.matriculaDao = matriculaDao;
        this.estudianteDao = estudianteDao;
        this.gradoDao = gradoDao;
        this.pagoDao = pagoDao;
    }

    @Transactional(readOnly = true)
    public List<MatriculaResponse> listar() {
        return matriculaDao.listarTodas().stream().map(MatriculaResponse::desde).toList();
    }

    public MatriculaResponse crear(MatriculaRequest r) {
        if (r.idEstudiante() == null) {
            throw new NegocioException("Debe seleccionar un estudiante.");
        }
        if (r.idGradoSeccion() == null) {
            throw new NegocioException("Debe seleccionar grado y sección.");
        }
        Estudiante estudiante = estudianteDao.findById(r.idEstudiante())
                .orElseThrow(() -> new NegocioException("El estudiante no existe."));
        GradoSeccion grado = gradoDao.findById(r.idGradoSeccion())
                .orElseThrow(() -> new NegocioException("El grado y sección no existe."));
        int anio = r.anio() != null ? r.anio() : Year.now().getValue();
        if (matriculaDao.existsByAnioAndEstudiante_Id(anio, estudiante.getId())) {
            throw new ConflictoException("El estudiante ya tiene una matrícula registrada para el año " + anio + ".");
        }
        Matricula m = new Matricula();
        m.setAnio(anio);
        m.setFecha(Validar.fechaOHoy(r.fecha(), "fecha"));
        m.setEstado(estadoNormalizado(r.estado()));
        m.setEstudiante(estudiante);
        m.setGradoSeccion(grado);
        m = matriculaDao.save(m);
        log.info("Se registró matrícula ID {} para {}", m.getId(), estudiante.obtenerNombreCompleto());
        return MatriculaResponse.desde(m);
    }

    /** Por ahora modifica solamente el estado (igual que en Python). */
    public void actualizar(Integer id, MatriculaRequest r) {
        if (r.estado() == null || r.estado().isBlank()) {
            throw new NegocioException("El estado es obligatorio.");
        }
        Matricula m = matriculaDao.findById(id).orElseThrow(() -> new NoEncontradoException("No se encontró la matrícula."));
        m.setEstado(estadoNormalizado(r.estado()));
        log.info("Se actualizó el estado de la matrícula ID {} a {}", id, m.getEstado());
    }

    public void eliminar(Integer id) {
        Matricula m = matriculaDao.findById(id).orElseThrow(() -> new NoEncontradoException("No se encontró la matrícula."));
        if (pagoDao.existsByMatricula_Id(id)) {
            throw new ConflictoException("No se puede eliminar: la matrícula tiene pagos registrados.");
        }
        matriculaDao.delete(m);
        log.info("Se eliminó la matrícula ID {}", id);
    }

    private String estadoNormalizado(String estado) {
        String limpio = Validar.opcional(estado, "estado", 30);
        return limpio == null ? "Pendiente" : Validar.capitalizar(limpio);
    }
}
