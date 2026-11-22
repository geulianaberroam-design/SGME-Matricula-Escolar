package com.sgme.matricula.servicio;

import com.sgme.matricula.dao.DocumentoDao;
import com.sgme.matricula.dao.EstudianteDao;
import com.sgme.matricula.dto.DocumentoRequest;
import com.sgme.matricula.dto.DocumentoResponse;
import com.sgme.matricula.excepcion.NegocioException;
import com.sgme.matricula.excepcion.NoEncontradoException;
import com.sgme.matricula.modelo.Documento;
import com.sgme.matricula.modelo.Estudiante;
import com.sgme.matricula.util.Validar;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DocumentoServicio {

    public static final List<String> ESTADOS = List.of("Pendiente", "Aprobado", "Rechazado", "Observación");

    private static final Logger log = LoggerFactory.getLogger(DocumentoServicio.class);

    private final DocumentoDao documentoDao;
    private final EstudianteDao estudianteDao;

    public DocumentoServicio(DocumentoDao documentoDao, EstudianteDao estudianteDao) {
        this.documentoDao = documentoDao;
        this.estudianteDao = estudianteDao;
    }

    @Transactional(readOnly = true)
    public List<DocumentoResponse> listar() {
        return documentoDao.listarTodos().stream().map(DocumentoResponse::desde).toList();
    }

    public DocumentoResponse crear(DocumentoRequest r) {
        Documento d = new Documento();
        aplicar(d, r);
        d = documentoDao.save(d);
        log.info("Se registró documento ID {} para el estudiante {}", d.getId(), d.getEstudiante().obtenerNombreCompleto());
        return DocumentoResponse.desde(documentoDao.buscarConDetalle(d.getId()).orElse(d));
    }

    public void actualizar(Integer id, DocumentoRequest r) {
        Documento d = documentoDao.findById(id).orElseThrow(() -> new NoEncontradoException("No se encontró el documento."));
        aplicar(d, r);
        log.info("Se actualizó el documento ID {}", id);
    }

    public void eliminar(Integer id) {
        Documento d = documentoDao.findById(id).orElseThrow(() -> new NoEncontradoException("No se encontró el documento."));
        documentoDao.delete(d);
        log.info("Se eliminó el documento ID {}", id);
    }

    private void aplicar(Documento d, DocumentoRequest r) {
        if (r.idEstudiante() == null) {
            throw new NegocioException("Debe seleccionar un estudiante.");
        }
        Estudiante e = estudianteDao.findById(r.idEstudiante())
                .orElseThrow(() -> new NegocioException("El estudiante no existe."));
        String tipo = Validar.requerido(r.tipo(), "tipo de documento", 50);
        String nombre = Validar.opcional(r.nombre(), "nombre", 150);
        d.setEstudiante(e);
        d.setTipo(tipo);
        d.setNombre(nombre != null ? nombre : tipo);
        d.setRuta(Validar.opcional(r.ruta(), "ruta", 300));
        d.setEstado(Validar.opcion(r.estado(), ESTADOS, "Pendiente", "estado"));
        d.setFechaRegistro(r.fechaRegistro() == null || r.fechaRegistro().isBlank()
                ? (d.getFechaRegistro() != null ? d.getFechaRegistro() : java.time.LocalDate.now())
                : Validar.fechaOHoy(r.fechaRegistro(), "fecha de registro"));
    }
}
