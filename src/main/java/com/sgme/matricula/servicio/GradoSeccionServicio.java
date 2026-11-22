package com.sgme.matricula.servicio;

import com.sgme.matricula.dao.GradoSeccionDao;
import com.sgme.matricula.dao.MatriculaDao;
import com.sgme.matricula.dto.GradoSeccionRequest;
import com.sgme.matricula.dto.GradoSeccionResponse;
import com.sgme.matricula.excepcion.ConflictoException;
import com.sgme.matricula.excepcion.NoEncontradoException;
import com.sgme.matricula.modelo.GradoSeccion;
import com.sgme.matricula.util.Validar;
import java.util.List;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class GradoSeccionServicio {

    private static final Logger log = LoggerFactory.getLogger(GradoSeccionServicio.class);

    private final GradoSeccionDao gradoDao;
    private final MatriculaDao matriculaDao;

    public GradoSeccionServicio(GradoSeccionDao gradoDao, MatriculaDao matriculaDao) {
        this.gradoDao = gradoDao;
        this.matriculaDao = matriculaDao;
    }

    @Transactional(readOnly = true)
    public List<GradoSeccionResponse> listar() {
        return gradoDao.findAll(Sort.by("id")).stream().map(GradoSeccionResponse::desde).toList();
    }

    public GradoSeccionResponse crear(GradoSeccionRequest r) {
        String grado = Validar.requerido(r.grado(), "grado", 20);
        String seccion = Validar.requerido(r.seccion(), "sección", 10).toUpperCase(Locale.ROOT);
        if (gradoDao.existsByGradoAndSeccion(grado, seccion)) {
            throw new ConflictoException("Ya existe el grado " + grado + " con la sección " + seccion + ".");
        }
        GradoSeccion g = new GradoSeccion();
        g.setGrado(grado);
        g.setSeccion(seccion);
        g = gradoDao.save(g);
        log.info("Se registró el grado y sección: {}", g.obtenerDescripcion());
        return GradoSeccionResponse.desde(g);
    }

    public void actualizar(Integer id, GradoSeccionRequest r) {
        GradoSeccion g = buscar(id);
        String grado = Validar.requerido(r.grado(), "grado", 20);
        String seccion = Validar.requerido(r.seccion(), "sección", 10).toUpperCase(Locale.ROOT);
        if (gradoDao.existsByGradoAndSeccionAndIdNot(grado, seccion, id)) {
            throw new ConflictoException("Ya existe el grado " + grado + " con la sección " + seccion + ".");
        }
        g.setGrado(grado);
        g.setSeccion(seccion);
        log.info("Se actualizó el grado y sección ID {}", id);
    }

    public void eliminar(Integer id) {
        GradoSeccion g = buscar(id);
        if (matriculaDao.existsByGradoSeccion_Id(id)) {
            throw new ConflictoException("No se puede eliminar: hay matrículas registradas en este grado y sección.");
        }
        gradoDao.delete(g);
        log.info("Se eliminó el grado y sección ID {}", id);
    }

    private GradoSeccion buscar(Integer id) {
        return gradoDao.findById(id).orElseThrow(() -> new NoEncontradoException("No se encontró el grado y sección."));
    }
}
