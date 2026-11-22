package com.sgme.matricula.servicio;

import com.sgme.matricula.dao.ApoderadoDao;
import com.sgme.matricula.dao.DocumentoDao;
import com.sgme.matricula.dao.EstudianteDao;
import com.sgme.matricula.dao.MatriculaDao;
import com.sgme.matricula.dto.EstudianteRequest;
import com.sgme.matricula.dto.EstudianteResponse;
import com.sgme.matricula.excepcion.ConflictoException;
import com.sgme.matricula.excepcion.NegocioException;
import com.sgme.matricula.excepcion.NoEncontradoException;
import com.sgme.matricula.modelo.Apoderado;
import com.sgme.matricula.modelo.Estudiante;
import com.sgme.matricula.util.Validar;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EstudianteServicio {

    private static final Logger log = LoggerFactory.getLogger(EstudianteServicio.class);

    private final EstudianteDao estudianteDao;
    private final ApoderadoDao apoderadoDao;
    private final MatriculaDao matriculaDao;
    private final DocumentoDao documentoDao;

    public EstudianteServicio(EstudianteDao estudianteDao, ApoderadoDao apoderadoDao,
                              MatriculaDao matriculaDao, DocumentoDao documentoDao) {
        this.estudianteDao = estudianteDao;
        this.apoderadoDao = apoderadoDao;
        this.matriculaDao = matriculaDao;
        this.documentoDao = documentoDao;
    }

    @Transactional(readOnly = true)
    public List<EstudianteResponse> listar() {
        return estudianteDao.findAll(Sort.by("id")).stream().map(EstudianteResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public EstudianteResponse obtener(Integer id) {
        return EstudianteResponse.desde(buscar(id));
    }

    public EstudianteResponse crear(EstudianteRequest r) {
        String dni = Validar.dni(r.dni());
        if (estudianteDao.existsByDni(dni)) {
            throw new ConflictoException("El DNI ya está registrado.");
        }
        Estudiante e = new Estudiante();
        e.setDni(dni);
        aplicar(e, r);
        e = estudianteDao.save(e);
        log.info("Se registró un estudiante: {}", e.obtenerNombreCompleto());
        return EstudianteResponse.desde(e);
    }

    public void actualizar(Integer id, EstudianteRequest r) {
        Estudiante e = buscar(id);
        String dni = Validar.dni(r.dni());
        if (estudianteDao.existsByDniAndIdNot(dni, id)) {
            throw new ConflictoException("El DNI ya pertenece a otro estudiante.");
        }
        e.setDni(dni);
        aplicar(e, r);
        log.info("Se actualizó el estudiante ID {}", id);
    }

    public void eliminar(Integer id) {
        Estudiante e = buscar(id);
        if (matriculaDao.existsByEstudiante_Id(id) || documentoDao.existsByEstudiante_Id(id)) {
            throw new ConflictoException("No se puede eliminar: el estudiante tiene matrículas o documentos registrados.");
        }
        estudianteDao.delete(e);
        log.info("Se eliminó el estudiante ID {}", id);
    }

    /** Copia nombres, contacto, fecha de nacimiento y apoderado (valida que el apoderado exista). */
    private void aplicar(Estudiante e, EstudianteRequest r) {
        e.setNombres(Validar.requerido(r.nombres(), "nombres", 100));
        e.setApellidos(Validar.requerido(r.apellidos(), "apellidos", 100));
        e.setTelefono(Validar.opcional(r.telefono(), "teléfono", 20));
        e.setEmail(Validar.opcional(r.email(), "email", 150));
        e.setDireccion(Validar.opcional(r.direccion(), "dirección", 200));
        e.setFechaNac(Validar.fechaOpcional(r.fechaNac(), "fecha de nacimiento"));
        if (r.idApoderado() == null) {
            throw new NegocioException("Debe seleccionar un apoderado.");
        }
        Apoderado ap = apoderadoDao.findById(r.idApoderado())
                .orElseThrow(() -> new NegocioException("El apoderado indicado no existe."));
        e.setApoderado(ap);
    }

    private Estudiante buscar(Integer id) {
        return estudianteDao.findById(id).orElseThrow(() -> new NoEncontradoException("No se encontró el estudiante."));
    }
}
