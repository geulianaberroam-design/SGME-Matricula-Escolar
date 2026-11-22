import React, { useMemo, useState } from "react";
import api from "../services/api";
import useAutoRefresh from "../hooks/useAutoRefresh";
import useSistema from "../hooks/useSistema";
import { etiquetaGrado, iniciales, formatearFecha, formatearMonto, hoyISO } from "../utils/estados";
import {
  Etiqueta, TituloSeccion, TarjetaMetrica, EncabezadoPagina, Pildora, Filtros, CajaBusqueda,
  Paginacion, Avatar, estiloBotonSecundario, estiloBotonAzul, estiloBotonGuardar
} from "../components/ui";

const POR_PAGINA = 8;

const estadosPago = [
  { id: "Pagado", label: "Pagado", activeBg: "#dcfce7", borderColor: "#22c55e", textColor: "#15803d", dotColor: "#22c55e" },
  { id: "Parcial", label: "Parcial", activeBg: "#fef9c3", borderColor: "#f59e0b", textColor: "#b45309", dotColor: "#f59e0b" },
  { id: "Anulado", label: "Anulado", activeBg: "#ffe4e6", borderColor: "#ef4444", textColor: "#be123c", dotColor: "#ef4444" }
];

const colorEstado = {
  Pagado: { bg: "#dcfce7", color: "#15803d" },
  Parcial: { bg: "#fef3c7", color: "#b45309" },
  Anulado: { bg: "#ffe4e6", color: "#be123c" }
};

const formularioVacio = () => ({
  idPago: "",
  fechaPago: hoyISO(),
  idMatricula: "",
  concepto: "Matrícula",
  metodoPago: "Efectivo",
  monto: "",
  comprobante: "",
  estadoPago: "Pagado"
});

const codigoPago = (p) => `PAG-${(p.fecha || "").slice(0, 4) || "----"}-${String(p.id).padStart(3, "0")}`;

export default function Pagos() {
  const sistema = useSistema();
  const [pagos, setPagos] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState(formularioVacio());

  // ----------------------------------------------------------
  // DATOS EN VIVO (GET /api/pagos y /api/matriculas, cada 15 s)
  // ----------------------------------------------------------
  const cargarDatos = async () => {
    try {
      const [rPagos, rMatriculas] = await Promise.all([api.get("/pagos"), api.get("/matriculas")]);
      setPagos(rPagos.data);
      setMatriculas(rMatriculas.data);
      setErrorCarga("");
    } catch (error) {
      setErrorCarga(error.mensajeUsuario || "No se pudieron cargar los pagos.");
    } finally {
      setCargando(false);
    }
  };
  useAutoRefresh(cargarDatos, 15000);

  // ----------------------------------------------------------
  // MÉTRICAS CALCULADAS A PARTIR DE LOS PAGOS REALES
  // ----------------------------------------------------------
  const metricas = useMemo(() => {
    const suma = (lista) => lista.reduce((t, p) => t + Number(p.monto || 0), 0);
    const pagados = pagos.filter((p) => p.estado === "Pagado");
    const parciales = pagos.filter((p) => p.estado === "Parcial");
    const anulados = pagos.filter((p) => p.estado === "Anulado");
    return {
      pagados: pagados.length,
      montoPagados: suma(pagados),
      parciales: parciales.length,
      anulados: anulados.length,
      recaudado: suma(pagados) + suma(parciales)
    };
  }, [pagos]);

  // ----------------------------------------------------------
  // FILTRO + BÚSQUEDA + PAGINACIÓN
  // ----------------------------------------------------------
  const pagosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return pagos
      .filter((p) => filtroEstado === "Todos" || p.estado === filtroEstado)
      .filter((p) => {
        if (!texto) return true;
        const e = p.estudiante || {};
        return [codigoPago(p), e.nombres, e.apellidos, e.dni, p.concepto, p.metodo_pago, p.comprobante]
          .join(" ")
          .toLowerCase()
          .includes(texto);
      })
      .sort((a, b) => b.id - a.id);
  }, [pagos, filtroEstado, busqueda]);

  const totalPaginas = Math.max(1, Math.ceil(pagosFiltrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = pagosFiltrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);
  const subtotal = pagosFiltrados.filter((p) => p.estado !== "Anulado").reduce((t, p) => t + Number(p.monto || 0), 0);

  // ----------------------------------------------------------
  // FORMULARIO
  // ----------------------------------------------------------
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const nuevo = () => setFormData(formularioVacio());

  const editar = (p) => {
    setFormData({
      idPago: p.id,
      fechaPago: p.fecha || hoyISO(),
      idMatricula: String(p.id_matricula),
      concepto: p.concepto || "",
      metodoPago: p.metodo_pago || "",
      monto: String(p.monto ?? ""),
      comprobante: p.comprobante || "",
      estadoPago: p.estado || "Pagado"
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminar = async (p) => {
    if (!p) {
      alert("Primero pulsa 'Editar' en el pago que quieres eliminar.");
      return;
    }
    if (!window.confirm(`¿Eliminar el pago ${codigoPago(p)}?`)) return;
    try {
      await api.delete(`/pagos/${p.id}`);
      if (String(formData.idPago) === String(p.id)) nuevo();
      await cargarDatos();
    } catch (error) {
      alert(error.mensajeUsuario || "No se pudo eliminar el pago.");
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!formData.idMatricula) return alert("Selecciona el estudiante (matrícula).");
    if (!formData.concepto.trim()) return alert("Ingresa el concepto del pago.");
    if (!formData.monto || Number(formData.monto) <= 0) return alert("Ingresa un monto mayor a 0.");
    if (!formData.comprobante.trim()) return alert("Ingresa el N° de comprobante.");

    const datos = {
      id_matricula: Number(formData.idMatricula),
      fecha: formData.fechaPago,
      monto: Number(formData.monto),
      comprobante: formData.comprobante.trim(),
      concepto: formData.concepto.trim(),
      metodo_pago: formData.metodoPago.trim(),
      estado: formData.estadoPago
    };

    try {
      setGuardando(true);
      if (formData.idPago) {
        await api.put(`/pagos/${formData.idPago}`, datos);
        alert("Pago actualizado correctamente.");
      } else {
        await api.post("/pagos", datos);
        alert("Pago registrado correctamente.");
      }
      nuevo();
      await cargarDatos();
    } catch (error) {
      alert(error.mensajeUsuario || "No se pudo guardar el pago.");
    } finally {
      setGuardando(false);
    }
  };

  const pagoEnEdicion = pagos.find((p) => String(p.id) === String(formData.idPago));
  const opcionesMatricula = [...matriculas].sort((a, b) =>
    `${a.estudiante?.apellidos} ${a.estudiante?.nombres}`.localeCompare(`${b.estudiante?.apellidos} ${b.estudiante?.nombres}`)
  );

  return (
    <div className="d-flex flex-column gap-4">
      {/* 1. ENCABEZADO */}
      <EncabezadoPagina
        icono="💳"
        titulo="Registro de Pagos"
        subtitulo={`Control de ingresos y pagos del año escolar ${sistema.anio_escolar}`}
      >
        <Pildora fondo="#dcfce7" color="#15803d">{formatearMonto(metricas.montoPagados)} cobrados</Pildora>
        <Pildora fondo="#fef3c7" color="#b45309">{metricas.parciales} parciales</Pildora>
      </EncabezadoPagina>

      {errorCarga && (
        <div className="alert alert-danger m-0 d-flex justify-content-between align-items-center">
          <span>{errorCarga}</span>
          <button className="btn btn-sm btn-outline-danger" onClick={cargarDatos}>Reintentar</button>
        </div>
      )}

      {/* 2. MÉTRICAS */}
      <div className="row g-3">
        <TarjetaMetrica icono="💰" fondo="#eff6ff" colorBadge="#2563eb" badge={sistema.anio_escolar}
          valor={formatearMonto(metricas.recaudado)} colorValor="#1d3b8f" titulo="Total recaudado" />
        <TarjetaMetrica icono="✅" fondo="#dcfce7" colorBadge="#16a34a" badge={formatearMonto(metricas.montoPagados)}
          valor={metricas.pagados} colorValor="#16a34a" titulo="Pagos completos" />
        <TarjetaMetrica icono="⌛" fondo="#fef3c7" colorBadge="#d97706" badge="pendiente de saldo"
          valor={metricas.parciales} colorValor="#d97706" titulo="Pagos parciales" />
        <TarjetaMetrica icono="🚫" fondo="#ffe4e6" colorBadge="#e11d48" badge="no contabilizados"
          valor={metricas.anulados} colorValor="#dc2626" titulo="Pagos anulados" />
      </div>

      {/* 3. FORMULARIO */}
      <div className="bg-white p-4 rounded-4 shadow-sm border border-light">
        <TituloSeccion
          derecha={
            <button type="button" onClick={nuevo} className="btn btn-link p-0 text-decoration-none fw-semibold" style={{ color: "#1d3b8f", fontSize: "14px" }}>
              Nuevo Registro
            </button>
          }
        >
          {formData.idPago ? "Editando pago" : "Registro de Pagos"}
        </TituloSeccion>

        <form onSubmit={handleGuardar}>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <Etiqueta>ID del pago</Etiqueta>
              <input type="text" className="form-control bg-light border-0 fw-bold" style={{ color: "#1d3b8f" }} readOnly
                value={pagoEnEdicion ? codigoPago(pagoEnEdicion) : "Se asigna al guardar"} />
            </div>
            <div className="col-12 col-md-6">
              <Etiqueta requerido>Fecha de pago</Etiqueta>
              <input type="date" name="fechaPago" className="form-control bg-light border-0" value={formData.fechaPago} onChange={handleChange} />
            </div>
            <div className="col-12">
              <Etiqueta requerido>Estudiante</Etiqueta>
              <select name="idMatricula" className="form-select bg-light border-0 text-secondary" value={formData.idMatricula} onChange={handleChange}>
                <option value="">— Seleccionar estudiante —</option>
                {opcionesMatricula.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.estudiante?.nombres} {m.estudiante?.apellidos} — {etiquetaGrado(m.grado_seccion?.grado)} {m.grado_seccion?.seccion} ({m.anio})
                  </option>
                ))}
              </select>
              {matriculas.length === 0 && !cargando && (
                <small className="text-muted">Aún no hay matrículas registradas: primero matricula a un estudiante.</small>
              )}
            </div>
            <div className="col-12 col-md-6">
              <Etiqueta requerido>Concepto</Etiqueta>
              <input type="text" name="concepto" list="lista-conceptos" className="form-control bg-light border-0" value={formData.concepto} onChange={handleChange} />
              <datalist id="lista-conceptos">
                <option value="Matrícula" /><option value="Pensión mensual" /><option value="Materiales" /><option value="Cuota de ingreso" />
              </datalist>
            </div>
            <div className="col-12 col-md-6">
              <Etiqueta>Método de pago</Etiqueta>
              <input type="text" name="metodoPago" list="lista-metodos" className="form-control bg-light border-0" value={formData.metodoPago} onChange={handleChange} />
              <datalist id="lista-metodos">
                <option value="Efectivo" /><option value="Yape / Plin" /><option value="Transferencia bancaria" /><option value="Depósito" /><option value="Tarjeta" />
              </datalist>
            </div>
            <div className="col-12 col-md-6">
              <Etiqueta requerido>Monto (S/.)</Etiqueta>
              <input type="number" min="0" step="0.01" name="monto" className="form-control bg-light border-0" placeholder="0.00" value={formData.monto} onChange={handleChange} />
            </div>
            <div className="col-12 col-md-6">
              <Etiqueta requerido>N° comprobante</Etiqueta>
              <input type="text" name="comprobante" className="form-control bg-light border-0" placeholder="Ej: B001-00456" value={formData.comprobante} onChange={handleChange} />
            </div>
            <div className="col-12">
              <Etiqueta>Estado del pago</Etiqueta>
              <div className="row g-2">
                {estadosPago.map((est) => {
                  const seleccionado = formData.estadoPago === est.id;
                  return (
                    <div key={est.id} className="col-12 col-md-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, estadoPago: est.id })}
                        className="btn w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3"
                        style={{
                          backgroundColor: seleccionado ? est.activeBg : "#f8fafc",
                          border: seleccionado ? `2px solid ${est.borderColor}` : "1px solid #e2e8f0",
                          color: seleccionado ? est.textColor : "#64748b",
                          transition: "all 0.2s"
                        }}
                      >
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: est.dotColor }}></span>
                        <span className="fw-bold" style={{ fontSize: "14px" }}>{est.label}</span>
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
                onClick={() => alert(formData.idPago ? "Ya estás editando este pago: modifica los datos y pulsa Guardar." : "Pulsa 'Editar' en la fila del pago de la tabla para cargarlo aquí.")}>
                <i className="bi bi-pencil-square me-2"></i>Editar
              </button>
              <button type="button" className="btn px-3 py-2 rounded-3 text-secondary" style={estiloBotonSecundario} onClick={() => eliminar(pagoEnEdicion)}>
                <i className="bi bi-trash me-2"></i>Eliminar
              </button>
            </div>
            <button type="button" onClick={nuevo} className="btn px-3 py-2 rounded-3 text-secondary border" style={{ backgroundColor: "#ffffff", fontSize: "14px" }}>
              ✕ Cancelar
            </button>
          </div>
        </form>
      </div>

      {/* 4. HISTORIAL */}
      <div className="bg-white p-4 rounded-4 shadow-sm border border-light">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div className="d-flex align-items-center gap-2">
            <div style={{ width: "4px", height: "20px", backgroundColor: "#1d3b8f", borderRadius: "2px" }}></div>
            <h5 className="fw-bold m-0" style={{ color: "#0f172a" }}>Historial de Pagos</h5>
            <span className="badge rounded-pill bg-light text-primary px-2 py-1 border" style={{ fontSize: "12px" }}>{pagos.length}</span>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Filtros opciones={["Todos", "Pagado", "Parcial", "Anulado"]} valor={filtroEstado} onCambio={(v) => { setFiltroEstado(v); setPagina(1); }} />
            <CajaBusqueda valor={busqueda} onCambio={(v) => { setBusqueda(v); setPagina(1); }} placeholder="Buscar pago..." />
          </div>
        </div>

        <div className="table-responsive" style={{ overflowX: "auto" }}>
          <table className="table table-borderless align-middle m-0" style={{ minWidth: "1000px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th className="py-3 px-3 text-muted small fw-bold" style={{ borderTopLeftRadius: "10px", borderBottomLeftRadius: "10px" }}>ID PAGO</th>
                <th className="py-3 px-3 text-muted small fw-bold">ESTUDIANTE</th>
                <th className="py-3 px-3 text-muted small fw-bold">CONCEPTO</th>
                <th className="py-3 px-3 text-muted small fw-bold">MÉTODO</th>
                <th className="py-3 px-3 text-muted small fw-bold">FECHA</th>
                <th className="py-3 px-3 text-muted small fw-bold">MONTO</th>
                <th className="py-3 px-3 text-muted small fw-bold">COMPROBANTE</th>
                <th className="py-3 px-3 text-muted small fw-bold">ESTADO</th>
                <th className="py-3 px-3 text-muted small fw-bold text-center" style={{ borderTopRightRadius: "10px", borderBottomRightRadius: "10px" }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan="9" className="text-center text-muted py-4">Cargando pagos...</td></tr>
              ) : visibles.length === 0 ? (
                <tr><td colSpan="9" className="text-center text-muted py-4">
                  {pagos.length === 0 ? "Aún no hay pagos registrados." : "No hay pagos que coincidan con el filtro."}
                </td></tr>
              ) : (
                visibles.map((p) => {
                  const e = p.estudiante || {};
                  const c = colorEstado[p.estado] || colorEstado.Pagado;
                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td className="py-3 px-3 fw-bold" style={{ color: "#1d3b8f", fontSize: "13px", whiteSpace: "nowrap" }}>{codigoPago(p)}</td>
                      <td className="py-3 px-3" style={{ whiteSpace: "nowrap" }}>
                        <div className="d-flex align-items-center gap-2">
                          <Avatar texto={iniciales(e.nombres, e.apellidos)} />
                          <div className="d-flex flex-column">
                            <span className="fw-bold" style={{ color: "#0f172a", fontSize: "13px" }}>{e.nombres} {e.apellidos}</span>
                            <small className="text-muted" style={{ fontSize: "11px" }}>
                              {etiquetaGrado(p.grado_seccion?.grado)} Primaria · Sec. {p.grado_seccion?.seccion}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-secondary" style={{ fontSize: "13px", whiteSpace: "nowrap" }}>{p.concepto}</td>
                      <td className="py-3 px-3 text-secondary" style={{ fontSize: "13px", whiteSpace: "nowrap" }}>{p.metodo_pago}</td>
                      <td className="py-3 px-3 text-secondary" style={{ fontSize: "13px", whiteSpace: "nowrap" }}>{formatearFecha(p.fecha)}</td>
                      <td className="py-3 px-3 fw-bold" style={{ color: "#0f172a", fontSize: "13px", whiteSpace: "nowrap", textDecoration: p.estado === "Anulado" ? "line-through" : "none" }}>
                        {formatearMonto(p.monto)}
                      </td>
                      <td className="py-3 px-3 text-secondary" style={{ fontSize: "13px", whiteSpace: "nowrap" }}>{p.comprobante || "-"}</td>
                      <td className="py-3 px-3" style={{ whiteSpace: "nowrap" }}>
                        <span className="px-3 py-1 rounded-pill small fw-semibold d-inline-flex align-items-center gap-1" style={{ backgroundColor: c.bg, color: c.color, fontSize: "12px" }}>
                          ● {p.estado}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center" style={{ whiteSpace: "nowrap" }}>
                        <div className="d-flex justify-content-center gap-1">
                          <button className="btn btn-sm px-2 py-1 rounded-2 fw-semibold" style={{ backgroundColor: "#eff6ff", color: "#2563eb", border: "none", fontSize: "12px" }} onClick={() => editar(p)}>Editar</button>
                          <button className="btn btn-sm px-2 py-1 rounded-2 fw-semibold" style={{ backgroundColor: "#ffe4e6", color: "#e11d48", border: "none", fontSize: "12px" }} onClick={() => eliminar(p)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. PIE */}
        <div className="d-flex justify-content-between align-items-center mt-4 pt-2 border-top">
          <div className="d-flex align-items-center gap-3">
            <span className="text-muted small" style={{ fontSize: "13px" }}>
              Mostrando {visibles.length} de {pagosFiltrados.length} pagos
            </span>
            <span className="fw-bold" style={{ color: "#0f172a", fontSize: "13px" }}>
              Subtotal: <span style={{ color: "#1d3b8f" }}>{formatearMonto(subtotal)}</span>
            </span>
          </div>
          <Paginacion pagina={paginaActual} totalPaginas={totalPaginas} onCambio={setPagina} />
        </div>
      </div>
    </div>
  );
}
