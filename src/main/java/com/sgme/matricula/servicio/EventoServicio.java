package com.sgme.matricula.servicio;

import com.sgme.matricula.dao.EventoDao;
import com.sgme.matricula.dto.EventoRequest;
import com.sgme.matricula.dto.EventoResponse;
import com.sgme.matricula.excepcion.NegocioException;
import com.sgme.matricula.excepcion.NoEncontradoException;
import com.sgme.matricula.modelo.Evento;
import com.sgme.matricula.util.Validar;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EventoServicio {

    private final EventoDao eventoDao;

    public EventoServicio(EventoDao eventoDao) {
        this.eventoDao = eventoDao;
    }

    @Transactional(readOnly = true)
    public List<EventoResponse> listar() {
        return eventoDao.findAll(Sort.by("fecha")).stream().map(EventoResponse::desde).toList();
    }

    public EventoResponse crear(EventoRequest r) {
        Evento e = new Evento();
        aplicar(e, r);
        return EventoResponse.desde(eventoDao.save(e));
    }

    public void actualizar(Integer id, EventoRequest r) {
        aplicar(buscar(id), r);
    }

    public void eliminar(Integer id) {
        eventoDao.delete(buscar(id));
    }

    private Evento buscar(Integer id) {
        return eventoDao.findById(id).orElseThrow(() -> new NoEncontradoException("No se encontró el evento."));
    }

    private void aplicar(Evento e, EventoRequest r) {
        e.setTitulo(Validar.requerido(r.titulo(), "título", 150));
        if (r.fecha() == null || r.fecha().isBlank()) {
            throw new NegocioException("El campo 'fecha' es obligatorio.");
        }
        e.setFecha(Validar.fechaOHoy(r.fecha(), "fecha"));
        e.setDescripcion(Validar.opcional(r.descripcion(), "descripción", 5000));
        e.setTipo(Validar.opcional(r.tipo(), "tipo", 50));
        String estado = Validar.opcional(r.estado(), "estado", 30);
        e.setEstado(estado != null ? estado : "Activo");
    }
}
