import React, { useMemo, useState } from "react";
import api from "../services/api";
import useAutoRefresh from "../hooks/useAutoRefresh";
import useSistema from "../hooks/useSistema";
import { etiquetaGrado } from "../utils/estados";
import {
  Etiqueta, TituloSeccion, TarjetaMetrica, Filtros, CajaBusqueda,
  estiloBotonSecundario, estiloBotonAzul, estiloBotonGuardar
} from "../components/ui";

const COLOR_GRADO = { 1: "#2563eb", 2: "#8b5cf6", 3: "#06b6d4", 4: "#f59e0b", 5: "#10b981", 6: "#ef4444" };
const COLOR_SECCION = { A: "#1d3b8f", B: "#7c3aed", C: "#0891b2", D: "#d97706" };
const SECCIONES_RAPIDAS = ["A", "B", "C", "D"];

const numeroGrado = (grado) => {
  const n = parseInt((grado ?? "").toString(), 10);
  return Number.isNaN(n) ? null : n;
};
const codigo = (id) => `GS-${String(id).padStart(3, "0")}`;
const formularioVacio = () => ({ idSeccion: "", grado: "", seccion: "" });

export default function Grados() {
  const sistema = useSistema();
  const [grados, setGrados] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [filtroGrado, setFiltroGrado] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState(formularioVacio());

  // Datos en vivo (GET /api/grados y /api/matriculas, cada 15 s)
  const cargarDatos = async () => {
    try {
      const [rGrados, rMatriculas] = await Promise.all([api.get("/grados"), api.get("/matriculas")]);
      setGrados(rGrados.data);
      setMatriculas(rMatriculas.data);
      setErrorCarga("");
    } catch (error) {
      setErrorCarga(error.mensajeUsuario || "No se pudieron cargar los grados y secciones.");
    } finally {
      setCargando(false);
    }
  };
  useAutoRefresh(cargarDatos, 15000);

  // Cantidad de matrículas por grado/sección
  const matriculadosPor = useMemo(() => {
    const mapa = {};
    matriculas.forEach((m) => {
      const id = m.grado_seccion?.id;
      if (id) mapa[id] = (mapa[id] || 0) + 1;
    });
    return mapa;
  }, [matriculas]);

  const metricas = useMemo(() => {
    const gradosDistintos = new Set(grados.map((g) => numeroGrado(g.grado) ?? g.grado));
    return {
      secciones: grados.length,
      grados: gradosDistintos.size,
      matriculados: matriculas.length,
      seccionesA: grados.filter((g) => (g.seccion || "").toUpperCase() === "A").length
    };
  }, [grados, matriculas]);

  const tabsGrado = useMemo(() => {
    const numeros = [...new Set(grados.map((g) => numeroGrado(g.grado)).filter((n) => n !== null))].sort((a, b) => a - b);
    return ["Todos", ...numeros.map((n) => `${n}°`)];
  }, [grados]);

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return grados
      .filter((g) => filtroGrado === "Todos" || etiquetaGrado(g.grado) === filtroGrado)
      .filter((g) => !texto || `${codigo(g.id)} ${g.grado} ${g.seccion} ${etiquetaGrado(g.grado)}`.toLowerCase().includes(texto))
      .sort((a, b) => (numeroGrado(a.grado) ?? 99) - (numeroGrado(b.grado) ?? 99) || (a.seccion || "").localeCompare(b.seccion || ""));
  }, [grados, filtroGrado, busqueda]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const nuevo = () => setFormData(formularioVacio());

  const editar = (g) => {
    setFormData({ idSeccion: g.id, grado: String(numeroGrado(g.grado) ?? g.grado), seccion: (g.seccion || "").toUpperCase() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminar = async (g) => {
    if (!g) {
      alert("Primero pulsa 'Editar' en el grado y sección que quieres eliminar.");
      return;
    }
    if (!window.confirm(`¿Eliminar ${etiquetaGrado(g.grado)} - Sección ${g.seccion}?`)) return;
    try {
      await api.delete(`/grados/${g.id}`);
      if (String(formData.idSeccion) === String(g.id)) nuevo();
      await cargarDatos();
    } catch (error) {
      alert(error.mensajeUsuario || "No se pudo eliminar el grado y sección.");
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!formData.grado) return alert("Selecciona el grado.");
    if (!formData.seccion) return alert("Selecciona la sección.");

    const datos = { grado: formData.grado, seccion: formData.seccion };
    try {
      setGuardando(true);
      if (formData.idSeccion) {
        await api.put(`/grados/${formData.idSeccion}`, datos);
        alert("Grado y sección actualizados correctamente.");
      } else {
        await api.post("/grados", datos);
        alert("Grado y sección registrados correctamente.");
      }
      nuevo();
      await cargarDatos();
    } catch (error) {
      alert(error.mensajeUsuario || "No se pudo guardar el grado y sección.");
    } finally {
      setGuardando(false);
    }
  };

  const enEdicion = grados.find((g) => String(g.id) === String(formData.idSeccion));

  return (
    <div className="d-flex flex-column gap-4">
      {/* 1. ENCABEZADO */}
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: "48px", height: "48px", backgroundColor: "#fef3c7", fontSize: "24px" }}>🏫</div>
          <div>
            <h3 className="fw-bold m-0" style={{ color: "#0f172a", fontSize: "22px" }}>Grados y Secciones</h3>
            <span className="text-muted small">Administración de aulas · Primaria · Año {sistema.anio_escolar}</span>
          </div>
        </div>
        <span className="px-3 py-2 rounded-pill small fw-semibold" style={{ backgroundColor: "#dcfce7", color: "#15803d" }}>
          {metricas.secciones} secciones activas
        </span>
      </div>

      {errorCarga && (
        <div className="alert alert-danger m-0 d-flex justify-content-between align-items-center">
          <span>{errorCarga}</span>
          <button className="btn btn-sm btn-outline-danger" onClick={cargarDatos}>Reintentar</button>
        </div>
      )}

      {/* 2. MÉTRICAS */}
      <div className="row g-3">
        <TarjetaMetrica icono="🏫" fondo="#eff6ff" colorBadge="#2563eb" badge="en el sistema" valor={metricas.secciones} colorValor="#1d3b8f" titulo="Total secciones" />
        <TarjetaMetrica icono="📚" fondo="#f3e8ff" colorBadge="#7c3aed" badge="primaria" valor={metricas.grados} colorValor="#7c3aed" titulo="Grados registrados" />
        <TarjetaMetrica icono="🧑‍🎓" fondo="#dcfce7" colorBadge="#059669" badge="asignadas" valor={metricas.matriculados} colorValor="#059669" titulo="Matrículas en aulas" />
        <TarjetaMetrica icono="A" fondo="#fef3c7" colorBadge="#d97706" badge="sección A" valor={metricas.seccionesA} colorValor="#d97706" titulo="Secciones A" />
      </div>

      {/* 3. FORMULARIO */}
      <div className="bg-white p-4 rounded-4 shadow-sm border border-light">
        <TituloSeccion
          derecha={<button type="button" onClick={nuevo} className="btn btn-link p-0 text-decoration-none fw-semibold" style={{ color: "#1d3b8f", fontSize: "14px" }}>Nuevo Registro</button>}
        >
          {formData.idSeccion ? "Editando grado y sección" : "Gestión de Grados y Secciones"}
        </TituloSeccion>

        <form onSubmit={handleGuardar}>
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <Etiqueta>ID de sección</Etiqueta>
              <input type="text" className="form-control bg-light border-0 fw-bold" style={{ color: "#1d3b8f" }} readOnly
                value={enEdicion ? codigo(enEdicion.id) : "Se asigna al guardar"} />
            </div>
            <div className="col-12 col-md-4">
              <Etiqueta requerido>Grado</Etiqueta>
              <select name="grado" className="form-select bg-light border-0 text-secondary" value={formData.grado} onChange={handleChange}>
                <option value="">— Seleccionar grado —</option>
                {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={String(n)}>{n}° de Primaria</option>)}
              </select>
            </div>
            <div className="col-12 col-md-4">
              <Etiqueta requerido>Sección</Etiqueta>
              <select name="seccion" className="form-select bg-light border-0 text-secondary" value={formData.seccion} onChange={handleChange}>
                <option value="">— Seleccionar sección —</option>
                {SECCIONES_RAPIDAS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-12">
              <Etiqueta>Selección rápida de sección</Etiqueta>
              <div className="row g-2">
                {SECCIONES_RAPIDAS.map((sec) => {
                  const sel = formData.seccion === sec;
                  return (
                    <div key={sec} className="col-6 col-sm-3">
                      <button type="button" onClick={() => setFormData({ ...formData, seccion: sec })}
                        className="btn w-100 py-2 rounded-3 fw-bold"
                        style={{ backgroundColor: sel ? "#eff6ff" : "#f8fafc", border: sel ? `2px solid ${COLOR_SECCION[sec]}` : "1px solid #e2e8f0", color: sel ? COLOR_SECCION[sec] : "#64748b", transition: "all 0.2s" }}>
                        {sec}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
            <div className="d-flex gap-2 flex-wrap">
              <button type="button" onClick={nuevo} className="btn px-3 py-2 rounded-3 fw-bold" style={estiloBotonAzul}>+ Nuevo</button>
              <button type="submit" disabled={guardando} className="btn px-4 py-2 rounded-3 fw-bold text-white" style={estiloBotonGuardar}>
                <i className="bi bi-floppy me-2"></i>{guardando ? "Guardando..." : "Guardar"}
              </button>
              <button type="button" className="btn px-3 py-2 rounded-3 text-secondary" style={estiloBotonSecundario}
                onClick={() => alert(formData.idSeccion ? "Ya estás editando este registro: modifica los datos y pulsa Guardar." : "Pulsa 'Editar' en la fila de la tabla para cargarla aquí.")}>
                <i className="bi bi-pencil-square me-2"></i>Editar
              </button>
              <button type="button" className="btn px-3 py-2 rounded-3 text-secondary" style={estiloBotonSecundario} onClick={() => eliminar(enEdicion)}>
                <i className="bi bi-trash me-2"></i>Eliminar
              </button>
            </div>
            <button type="button" onClick={nuevo} className="btn px-3 py-2 rounded-3 text-secondary border" style={{ backgroundColor: "#ffffff", fontSize: "14px" }}>✕ Cancelar</button>
          </div>
        </form>
      </div>

      {/* 4. LISTADO */}
      <div className="bg-white p-4 rounded-4 shadow-sm border border-light">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div className="d-flex align-items-center gap-2">
            <div style={{ width: "4px", height: "20px", backgroundColor: "#1d3b8f", borderRadius: "2px" }}></div>
            <h5 className="fw-bold m-0" style={{ color: "#0f172a" }}>Listado de Grados y Secciones</h5>
            <span className="badge rounded-pill bg-light text-primary px-2 py-1 border" style={{ fontSize: "12px" }}>{grados.length}</span>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Filtros opciones={tabsGrado} valor={filtroGrado} onCambio={setFiltroGrado} />
            <CajaBusqueda valor={busqueda} onCambio={setBusqueda} placeholder="Buscar..." />
          </div>
        </div>

        <div className="table-responsive" style={{ overflowX: "auto" }}>
          <table className="table table-borderless align-middle m-0" style={{ minWidth: "700px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th className="py-3 px-3 text-muted small fw-bold" style={{ borderTopLeftRadius: "10px", borderBottomLeftRadius: "10px" }}>ID</th>
                <th className="py-3 px-3 text-muted small fw-bold">GRADO</th>
                <th className="py-3 px-3 text-muted small fw-bold text-center">SECCIÓN</th>
                <th className="py-3 px-3 text-muted small fw-bold text-center">MATRICULADOS</th>
                <th className="py-3 px-3 text-muted small fw-bold text-center" style={{ borderTopRightRadius: "10px", borderBottomRightRadius: "10px" }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan="5" className="text-center text-muted py-4">Cargando grados y secciones...</td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan="5" className="text-center text-muted py-4">
                  {grados.length === 0 ? "Aún no hay grados y secciones registrados." : "No hay registros que coincidan con el filtro."}
                </td></tr>
              ) : (
                filtrados.map((g) => {
                  const n = numeroGrado(g.grado);
                  const seccion = (g.seccion || "").toUpperCase();
                  return (
                    <tr key={g.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td className="py-3 px-3 fw-bold" style={{ color: "#1d3b8f", fontSize: "13px", whiteSpace: "nowrap" }}>{codigo(g.id)}</td>
                      <td className="py-3 px-3" style={{ whiteSpace: "nowrap" }}>
                        <div className="d-flex align-items-center gap-3">
                          <div className="rounded-3 d-flex align-items-center justify-content-center text-white fw-bold"
                            style={{ width: "36px", height: "36px", backgroundColor: COLOR_GRADO[n] || "#64748b", fontSize: "13px", flexShrink: 0 }}>
                            {etiquetaGrado(g.grado)}
                          </div>
                          <div className="d-flex flex-column">
                            <span className="fw-bold" style={{ color: "#0f172a", fontSize: "14px" }}>{etiquetaGrado(g.grado)} de Primaria</span>
                            <small className="text-muted" style={{ fontSize: "11px" }}>Nivel Primaria</small>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center" style={{ whiteSpace: "nowrap" }}>
                        <span className="fw-bold" style={{ color: COLOR_SECCION[seccion] || "#1d3b8f", fontSize: "16px" }}>{g.seccion}</span>
                      </td>
                      <td className="py-3 px-3 text-center fw-bold" style={{ color: "#0f172a", fontSize: "14px" }}>{matriculadosPor[g.id] || 0}</td>
                      <td className="py-3 px-3 text-center" style={{ whiteSpace: "nowrap" }}>
                        <div className="d-flex justify-content-center gap-1">
                          <button className="btn btn-sm px-2 py-1 rounded-2 fw-semibold" style={{ backgroundColor: "#eff6ff", color: "#2563eb", border: "none", fontSize: "12px" }} onClick={() => editar(g)}>Editar</button>
                          <button className="btn btn-sm px-2 py-1 rounded-2 fw-semibold" style={{ backgroundColor: "#ffe4e6", color: "#e11d48", border: "none", fontSize: "12px" }} onClick={() => eliminar(g)}>Eliminar</button>
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
          <span className="text-muted small" style={{ fontSize: "13px" }}>Mostrando {filtrados.length} de {grados.length} registros</span>
        </div>
      </div>
    </div>
  );
}
