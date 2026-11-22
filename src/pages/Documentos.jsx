import React, { useMemo, useState } from "react";
import api from "../services/api";
import useAutoRefresh from "../hooks/useAutoRefresh";
import useSistema from "../hooks/useSistema";
import { iniciales, formatearFecha } from "../utils/estados";
import {
  Etiqueta, TituloSeccion, TarjetaMetrica, EncabezadoPagina, Pildora, Filtros, CajaBusqueda,
  Paginacion, Avatar, estiloBotonSecundario, estiloBotonAzul, estiloBotonGuardar
} from "../components/ui";

const POR_PAGINA = 8;

const tiposDoc = [
  { id: "DNI", label: "DNI", icon: "🎴", bg: "#eff6ff", color: "#2563eb" },
  { id: "Partida de Nacimiento", label: "Partida de Nacimiento", icon: "📄", bg: "#f3e8ff", color: "#7e22ce" },
  { id: "Foto", label: "Foto", icon: "📷", bg: "#dcfce7", color: "#15803d" },
  { id: "Libreta de Notas", label: "Libreta de Notas", icon: "📓", bg: "#fef3c7", color: "#b45309" }
];

const estadosVisuales = [
  { id: "Pendiente", label: "Pendiente", icon: "⌛", activeBg: "#fef9c3", borderColor: "#f59e0b", textColor: "#b45309", bg: "#fef3c7" },
  { id: "Aprobado", label: "Aprobado", icon: "✅", activeBg: "#dcfce7", borderColor: "#22c55e", textColor: "#166534", bg: "#dcfce7" },
  { id: "Rechazado", label: "Rechazado", icon: "❌", activeBg: "#ffe4e6", borderColor: "#ef4444", textColor: "#be123c", bg: "#ffe4e6" },
  { id: "Observación", label: "Observación", icon: "👁️", activeBg: "#f1f5f9", borderColor: "#94a3b8", textColor: "#475569", bg: "#f1f5f9" }
];

const metaTipo = (tipo) =>
  tiposDoc.find((t) => t.id === tipo) || { icon: "📎", bg: "#f1f5f9", color: "#475569" };
const metaEstado = (estado) => estadosVisuales.find((e) => e.id === estado) || estadosVisuales[0];

const formularioVacio = () => ({
  idDocumento: "",
  idEstudiante: "",
  tipoDocumento: "DNI",
  estadoDocumento: "Pendiente",
  ruta: ""
});

const codigoDoc = (d) => `DOC-${String(d.id).padStart(3, "0")}`;
const codigoEst = (e) => `EST-${String(e).padStart(3, "0")}`;

export default function Documentos() {
  const sistema = useSistema();
  const [documentos, setDocumentos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState(formularioVacio());

  // Datos en vivo (GET /api/documentos y /api/estudiantes, cada 15 s)
  const cargarDatos = async () => {
    try {
      const [rDocs, rEst] = await Promise.all([api.get("/documentos"), api.get("/estudiantes")]);
      setDocumentos(rDocs.data);
      setEstudiantes(rEst.data);
      setErrorCarga("");
    } catch (error) {
      setErrorCarga(error.mensajeUsuario || "No se pudieron cargar los documentos.");
    } finally {
      setCargando(false);
    }
  };
  useAutoRefresh(cargarDatos, 15000);

  const conteo = useMemo(() => {
    const cuenta = (estado) => documentos.filter((d) => d.estado === estado).length;
    return {
      total: documentos.length,
      aprobados: cuenta("Aprobado"),
      pendientes: cuenta("Pendiente"),
      observados: cuenta("Observación") + cuenta("Rechazado")
    };
  }, [documentos]);

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return documentos
      .filter((d) => filtroEstado === "Todos" || d.estado === filtroEstado)
      .filter((d) => !tipoFiltro || (d.tipo || "").toLowerCase().includes(tipoFiltro.toLowerCase()))
      .filter((d) => {
        if (!texto) return true;
        const e = d.estudiante || {};
        return [codigoDoc(d), e.nombres, e.apellidos, e.dni, d.tipo, d.nombre].join(" ").toLowerCase().includes(texto);
      })
      .sort((a, b) => b.id - a.id);
  }, [documentos, filtroEstado, tipoFiltro, busqueda]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  // Expediente del estudiante seleccionado en el formulario
  const estudianteSel = estudiantes.find((e) => String(e.id) === String(formData.idEstudiante));
  const docsEstudiante = documentos.filter((d) => String(d.id_estudiante) === String(formData.idEstudiante));
  const aprobadosEst = tiposDoc.filter((t) => docsEstudiante.some((d) => d.tipo === t.id && d.estado === "Aprobado")).length;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const nuevo = () => setFormData(formularioVacio());

  const editar = (d) => {
    setFormData({
      idDocumento: d.id,
      idEstudiante: String(d.id_estudiante),
      tipoDocumento: d.tipo,
      estadoDocumento: d.estado,
      ruta: d.ruta || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminar = async (d) => {
    if (!d) {
      alert("Primero pulsa 'Editar' en el documento que quieres eliminar.");
      return;
    }
    if (!window.confirm(`¿Eliminar el documento ${codigoDoc(d)}?`)) return;
    try {
      await api.delete(`/documentos/${d.id}`);
      if (String(formData.idDocumento) === String(d.id)) nuevo();
      await cargarDatos();
    } catch (error) {
      alert(error.mensajeUsuario || "No se pudo eliminar el documento.");
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!formData.idEstudiante) return alert("Selecciona un estudiante.");
    if (!formData.tipoDocumento) return alert("Selecciona el tipo de documento.");

    const datos = {
      id_estudiante: Number(formData.idEstudiante),
      tipo: formData.tipoDocumento,
      nombre: formData.tipoDocumento,
      ruta: formData.ruta.trim(),
      estado: formData.estadoDocumento
    };

    try {
      setGuardando(true);
      if (formData.idDocumento) {
        await api.put(`/documentos/${formData.idDocumento}`, datos);
        alert("Documento actualizado correctamente.");
      } else {
        await api.post("/documentos", datos);
        alert("Documento registrado correctamente.");
      }
      nuevo();
      await cargarDatos();
    } catch (error) {
      alert(error.mensajeUsuario || "No se pudo guardar el documento.");
    } finally {
      setGuardando(false);
    }
  };

  const docEnEdicion = documentos.find((d) => String(d.id) === String(formData.idDocumento));
  const estudiantesOrdenados = [...estudiantes].sort((a, b) =>
    `${a.apellidos} ${a.nombres}`.localeCompare(`${b.apellidos} ${b.nombres}`)
  );

  return (
    <div className="d-flex flex-column gap-4">
      {/* 1. ENCABEZADO */}
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: "48px", height: "48px", backgroundColor: "#fef3c7", fontSize: "24px" }}>📁</div>
          <div>
            <h3 className="fw-bold m-0" style={{ color: "#0f172a", fontSize: "22px" }}>Gestión de Documentos</h3>
            <span className="text-muted small">Control de expedientes escolares · Año {sistema.anio_escolar}</span>
          </div>
        </div>
        <div className="d-flex gap-2">
          <Pildora fondo="#dcfce7" color="#15803d">{conteo.aprobados} aprobados</Pildora>
          <Pildora fondo="#fef3c7" color="#b45309">{conteo.pendientes} pendientes</Pildora>
        </div>
      </div>

      {errorCarga && (
        <div className="alert alert-danger m-0 d-flex justify-content-between align-items-center">
          <span>{errorCarga}</span>
          <button className="btn btn-sm btn-outline-danger" onClick={cargarDatos}>Reintentar</button>
        </div>
      )}

      {/* 2. MÉTRICAS */}
      <div className="row g-3">
        <TarjetaMetrica icono="📚" fondo="#eff6ff" colorBadge="#2563eb" badge={sistema.anio_escolar} valor={conteo.total} colorValor="#1d3b8f" titulo="Total documentos" />
        <TarjetaMetrica icono="✅" fondo="#dcfce7" colorBadge="#16a34a" badge="validados" valor={conteo.aprobados} colorValor="#16a34a" titulo="Aprobados" />
        <TarjetaMetrica icono="⌛" fondo="#fef3c7" colorBadge="#d97706" badge="por revisar" valor={conteo.pendientes} colorValor="#d97706" titulo="Pendientes" />
        <TarjetaMetrica icono="👁️" fondo="#ffe4e6" colorBadge="#e11d48" badge="requieren atención" valor={conteo.observados} colorValor="#dc2626" titulo="Con observaciones" />
      </div>

      {/* 3. FORMULARIO + ESTADO DEL EXPEDIENTE */}
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="bg-white p-4 rounded-4 shadow-sm border border-light h-100">
            <TituloSeccion
              derecha={<button type="button" onClick={nuevo} className="btn btn-link p-0 text-decoration-none fw-semibold" style={{ color: "#1d3b8f", fontSize: "14px" }}>Nuevo Registro</button>}
            >
              {formData.idDocumento ? "Editando documento" : "Gestión de Documentos"}
            </TituloSeccion>

            <form onSubmit={handleGuardar}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <Etiqueta>ID del documento</Etiqueta>
                  <input type="text" className="form-control bg-light border-0 fw-bold" style={{ color: "#1d3b8f" }} readOnly
                    value={docEnEdicion ? codigoDoc(docEnEdicion) : "Se asigna al guardar"} />
                </div>
                <div className="col-12 col-md-6">
                  <Etiqueta requerido>Estado del documento</Etiqueta>
                  <select name="estadoDocumento" className="form-select bg-light border-0 text-secondary" value={formData.estadoDocumento} onChange={handleChange}>
                    {estadosVisuales.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
                  </select>
                </div>
                <div className="col-12">
                  <Etiqueta requerido>Estudiante</Etiqueta>
                  <select name="idEstudiante" className="form-select bg-light border-0 text-secondary" value={formData.idEstudiante} onChange={handleChange}>
                    <option value="">— Seleccionar estudiante —</option>
                    {estudiantesOrdenados.map((e) => (
                      <option key={e.id} value={e.id}>{e.nombres} {e.apellidos}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <Etiqueta requerido>Tipo de documento</Etiqueta>
                  <div className="row g-2">
                    {tiposDoc.map((t) => {
                      const sel = formData.tipoDocumento === t.id;
                      return (
                        <div key={t.id} className="col-6 col-md-3">
                          <button type="button" onClick={() => setFormData({ ...formData, tipoDocumento: t.id })}
                            className="btn w-100 py-2 d-flex flex-column align-items-center gap-1 rounded-3"
                            style={{ backgroundColor: sel ? t.bg : "#f8fafc", border: sel ? `2px solid ${t.color}` : "1px solid #e2e8f0", color: sel ? t.color : "#64748b", transition: "all 0.2s" }}>
                            <span style={{ fontSize: "18px" }}>{t.icon}</span>
                            <span className="fw-bold" style={{ fontSize: "11px" }}>{t.label}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="col-12">
                  <Etiqueta>Estado visual</Etiqueta>
                  <div className="row g-2">
                    {estadosVisuales.map((est) => {
                      const sel = formData.estadoDocumento === est.id;
                      return (
                        <div key={est.id} className="col-6 col-md-3">
                          <button type="button" onClick={() => setFormData({ ...formData, estadoDocumento: est.id })}
                            className="btn w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3"
                            style={{ backgroundColor: sel ? est.activeBg : "#f8fafc", border: sel ? `2px solid ${est.borderColor}` : "1px solid #e2e8f0", color: sel ? est.textColor : "#64748b", transition: "all 0.2s" }}>
                            <span style={{ fontSize: "18px" }}>{est.icon}</span>
                            <span className="fw-bold" style={{ fontSize: "12px" }}>{est.label}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="col-12">
                  <Etiqueta>Ruta o enlace del archivo (opcional)</Etiqueta>
                  <input type="text" name="ruta" className="form-control bg-light border-0" placeholder="Ej: C:\expedientes\dni_camila.pdf" value={formData.ruta} onChange={handleChange} />
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                <div className="d-flex gap-2 flex-wrap">
                  <button type="button" onClick={nuevo} className="btn px-3 py-2 rounded-3 fw-bold" style={estiloBotonAzul}>+ Nuevo</button>
                  <button type="submit" disabled={guardando} className="btn px-4 py-2 rounded-3 fw-bold text-white" style={estiloBotonGuardar}>
                    <i className="bi bi-floppy me-2"></i>{guardando ? "Guardando..." : "Guardar"}
                  </button>
                  <button type="button" className="btn px-3 py-2 rounded-3 text-secondary" style={estiloBotonSecundario}
                    onClick={() => alert(formData.idDocumento ? "Ya estás editando este documento: modifica los datos y pulsa Guardar." : "Pulsa 'Editar' en la fila del documento de la tabla para cargarlo aquí.")}>
                    <i className="bi bi-pencil-square me-2"></i>Editar
                  </button>
                  <button type="button" className="btn px-3 py-2 rounded-3 text-secondary" style={estiloBotonSecundario} onClick={() => eliminar(docEnEdicion)}>
                    <i className="bi bi-trash me-2"></i>Eliminar
                  </button>
                </div>
                <button type="button" onClick={nuevo} className="btn px-3 py-2 rounded-3 text-secondary border" style={{ backgroundColor: "#ffffff", fontSize: "14px" }}>✕ Cancelar</button>
              </div>
            </form>
          </div>
        </div>

        {/* ESTADO DEL EXPEDIENTE (en vivo según el estudiante elegido) */}
        <div className="col-12 col-lg-4">
          <div className="bg-white p-4 rounded-4 shadow-sm border border-light h-100 d-flex flex-column">
            <TituloSeccion>Estado del expediente</TituloSeccion>
            {!estudianteSel ? (
              <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center p-4">
                <div className="mb-3" style={{ fontSize: "48px" }}>📁</div>
                <p className="text-muted small m-0" style={{ maxWidth: "220px", fontSize: "13px" }}>
                  Selecciona un estudiante para ver el estado de su expediente
                </p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                <div>
                  <div className="fw-bold" style={{ color: "#0f172a" }}>{estudianteSel.nombres} {estudianteSel.apellidos}</div>
                  <small className="text-muted">{codigoEst(estudianteSel.id)} · DNI {estudianteSel.dni}</small>
                </div>
                <div>
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="text-muted">Documentos aprobados</span>
                    <span className="fw-bold" style={{ color: "#1d3b8f" }}>{aprobadosEst} de {tiposDoc.length}</span>
                  </div>
                  <div className="progress" style={{ height: "8px" }}>
                    <div className="progress-bar bg-success" style={{ width: `${(aprobadosEst / tiposDoc.length) * 100}%` }}></div>
                  </div>
                </div>
                <div className="d-flex flex-column gap-2">
                  {tiposDoc.map((t) => {
                    const doc = docsEstudiante.find((d) => d.tipo === t.id);
                    const est = doc ? metaEstado(doc.estado) : null;
                    return (
                      <div key={t.id} className="d-flex justify-content-between align-items-center p-2 rounded-3" style={{ backgroundColor: "#f8fafc" }}>
                        <span style={{ fontSize: "13px" }}>{t.icon} {t.label}</span>
                        {est ? (
                          <span className="px-2 py-1 rounded-pill fw-semibold" style={{ backgroundColor: est.bg, color: est.textColor, fontSize: "11px" }}>{est.icon} {est.label}</span>
                        ) : (
                          <span className="px-2 py-1 rounded-pill fw-semibold" style={{ backgroundColor: "#f1f5f9", color: "#94a3b8", fontSize: "11px" }}>Sin entregar</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. HISTORIAL */}
      <div className="bg-white p-4 rounded-4 shadow-sm border border-light">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div className="d-flex align-items-center gap-2">
            <div style={{ width: "4px", height: "20px", backgroundColor: "#1d3b8f", borderRadius: "2px" }}></div>
            <h5 className="fw-bold m-0" style={{ color: "#0f172a" }}>Historial de Documentos</h5>
            <span className="badge rounded-pill bg-light text-primary px-2 py-1 border" style={{ fontSize: "12px" }}>{documentos.length}</span>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Filtros opciones={["Todos", "Pendiente", "Aprobado", "Rechazado", "Observación"]} valor={filtroEstado} onCambio={(v) => { setFiltroEstado(v); setPagina(1); }} />
            <select className="form-select form-select-sm bg-light border-0 rounded-pill" value={tipoFiltro} onChange={(e) => { setTipoFiltro(e.target.value); setPagina(1); }} style={{ width: "130px", fontSize: "12px" }}>
              <option value="">— Tipo —</option>
              <option value="DNI">DNI</option>
              <option value="Partida">Partida</option>
              <option value="Foto">Foto</option>
              <option value="Libreta">Libreta</option>
            </select>
            <CajaBusqueda valor={busqueda} onCambio={(v) => { setBusqueda(v); setPagina(1); }} placeholder="Buscar documento..." />
          </div>
        </div>

        <div className="table-responsive" style={{ overflowX: "auto" }}>
          <table className="table table-borderless align-middle m-0" style={{ minWidth: "900px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th className="py-3 px-3 text-muted small fw-bold" style={{ borderTopLeftRadius: "10px", borderBottomLeftRadius: "10px" }}>ID</th>
                <th className="py-3 px-3 text-muted small fw-bold">ESTUDIANTE</th>
                <th className="py-3 px-3 text-muted small fw-bold">TIPO DE DOCUMENTO</th>
                <th className="py-3 px-3 text-muted small fw-bold">ESTADO</th>
                <th className="py-3 px-3 text-muted small fw-bold">FECHA</th>
                <th className="py-3 px-3 text-muted small fw-bold text-center" style={{ borderTopRightRadius: "10px", borderBottomRightRadius: "10px" }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan="6" className="text-center text-muted py-4">Cargando documentos...</td></tr>
              ) : visibles.length === 0 ? (
                <tr><td colSpan="6" className="text-center text-muted py-4">
                  {documentos.length === 0 ? "Aún no hay documentos registrados." : "No hay documentos que coincidan con el filtro."}
                </td></tr>
              ) : (
                visibles.map((d) => {
                  const e = d.estudiante || {};
                  const t = metaTipo(d.tipo);
                  const est = metaEstado(d.estado);
                  return (
                    <tr key={d.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td className="py-3 px-3 fw-bold" style={{ color: "#1d3b8f", fontSize: "13px", whiteSpace: "nowrap" }}>{codigoDoc(d)}</td>
                      <td className="py-3 px-3" style={{ whiteSpace: "nowrap" }}>
                        <div className="d-flex align-items-center gap-2">
                          <Avatar texto={iniciales(e.nombres, e.apellidos)} />
                          <div className="d-flex flex-column">
                            <span className="fw-bold" style={{ color: "#0f172a", fontSize: "13px" }}>{e.nombres} {e.apellidos}</span>
                            <small className="text-muted" style={{ fontSize: "11px" }}>{codigoEst(d.id_estudiante)}</small>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3" style={{ whiteSpace: "nowrap" }}>
                        <span className="px-3 py-1 rounded-pill small fw-semibold d-inline-flex align-items-center gap-1" style={{ backgroundColor: t.bg, color: t.color, fontSize: "12px" }}>
                          <span>{t.icon}</span>{d.tipo}
                        </span>
                      </td>
                      <td className="py-3 px-3" style={{ whiteSpace: "nowrap" }}>
                        <span className="px-3 py-1 rounded-pill small fw-semibold d-inline-flex align-items-center gap-1" style={{ backgroundColor: est.bg, color: est.textColor, fontSize: "12px" }}>
                          <span>{est.icon}</span>{d.estado}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-secondary" style={{ fontSize: "13px", whiteSpace: "nowrap" }}>{formatearFecha(d.fecha_registro)}</td>
                      <td className="py-3 px-3 text-center" style={{ whiteSpace: "nowrap" }}>
                        <div className="d-flex justify-content-center gap-1">
                          <button className="btn btn-sm px-2 py-1 rounded-2 fw-semibold" style={{ backgroundColor: "#eff6ff", color: "#2563eb", border: "none", fontSize: "12px" }} onClick={() => editar(d)}>Editar</button>
                          <button className="btn btn-sm px-2 py-1 rounded-2 fw-semibold" style={{ backgroundColor: "#ffe4e6", color: "#e11d48", border: "none", fontSize: "12px" }} onClick={() => eliminar(d)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-4 pt-2 border-top">
          <span className="text-muted small" style={{ fontSize: "13px" }}>Mostrando {visibles.length} de {filtrados.length} documentos</span>
          <Paginacion pagina={paginaActual} totalPaginas={totalPaginas} onCambio={setPagina} />
        </div>
      </div>
    </div>
  );
}
