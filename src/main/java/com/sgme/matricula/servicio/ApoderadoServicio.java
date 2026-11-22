package com.sgme.matricula.servicio;

import com.sgme.matricula.dao.ApoderadoDao;
import com.sgme.matricula.dao.EstudianteDao;
import com.sgme.matricula.dto.ApoderadoRequest;
import com.sgme.matricula.dto.ApoderadoResponse;
import com.sgme.matricula.excepcion.ConflictoException;
import com.sgme.matricula.excepcion.NoEncontradoException;
import com.sgme.matricula.modelo.Apoderado;
import com.sgme.matricula.util.Validar;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ApoderadoServicio {

    private static final Logger log = LoggerFactory.getLogger(ApoderadoServicio.class);

    private final ApoderadoDao apoderadoDao;
    private final EstudianteDao estudianteDao;

    public ApoderadoServicio(ApoderadoDao apoderadoDao, EstudianteDao estudianteDao) {
        this.apoderadoDao = apoderadoDao;
        this.estudianteDao = estudianteDao;
    }

    @Transactional(readOnly = true)
    public List<ApoderadoResponse> listar() {
        return apoderadoDao.findAll(Sort.by("id")).stream().map(ApoderadoResponse::desde).toList();
    }

    public ApoderadoResponse crear(ApoderadoRequest r) {
        String dni = Validar.dni(r.dni());
        if (apoderadoDao.existsByDni(dni)) {
            throw new ConflictoException("El DNI ya está registrado en otro apoderado.");
        }
        Apoderado a = new Apoderado();
        a.setDni(dni);
        aplicar(a, r);
        a = apoderadoDao.save(a);
        log.info("Se registró un apoderado: {}", a.obtenerNombreCompleto());
        return ApoderadoResponse.desde(a);
    }

    /** Como en Python, el DNI no se modifica; sí nombres, apellidos, teléfono, correo y parentesco. */
    public void actualizar(Integer id, ApoderadoRequest r) {
        Apoderado a = buscar(id);
        aplicar(a, r);
        log.info("Se actualizó el apoderado ID {}", id);
    }

    public void eliminar(Integer id) {
        Apoderado a = buscar(id);
        if (estudianteDao.existsByApoderado_Id(id)) {
            throw new ConflictoException("No se puede eliminar: el apoderado tiene estudiantes asociados.");
        }
        apoderadoDao.delete(a);
        log.info("Se eliminó el apoderado ID {}", id);
    }

    private void aplicar(Apoderado a, ApoderadoRequest r) {
        a.setNombres(Validar.requerido(r.nombres(), "nombres", 100));
        a.setApellidos(Validar.requerido(r.apellidos(), "apellidos", 100));
        a.setTelefono(Validar.opcional(r.telefono(), "teléfono", 20));
        a.setEmail(Validar.opcional(r.email(), "email", 150));
        a.setParentesco(Validar.opcional(r.parentesco(), "parentesco", 50));
    }

    private Apoderado buscar(Integer id) {
        return apoderadoDao.findById(id).orElseThrow(() -> new NoEncontradoException("No se encontró el apoderado."));
    }
}
