import React from "react";

// Piezas visuales compartidas por Pagos, Documentos y Grados (mismo diseño que el resto del sistema).

export const Etiqueta = ({ children, requerido }) => (
  <label className="form-label text-uppercase fw-bold text-muted" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
    {children} {requerido && <span className="text-danger">*</span>}
  </label>
);

export const TituloSeccion = ({ children, contador, derecha }) => (
  <div className="d-flex justify-content-between align-items-center mb-4">
    <div className="d-flex align-items-center gap-2">
      <div style={{ width: "4px", height: "20px", backgroundColor: "#1d3b8f", borderRadius: "2px" }}></div>
      <h5 className="fw-bold m-0" style={{ color: "#0f172a" }}>{children}</h5>
      {contador !== undefined && (
        <span className="badge rounded-pill bg-light text-primary px-2 py-1 border" style={{ fontSize: "12px" }}>
          {contador}
        </span>
      )}
    </div>
    {derecha}
  </div>
);

export const TarjetaMetrica = ({ icono, fondo, colorBadge, badge, valor, colorValor, titulo }) => (
  <div className="col-12 col-sm-6 col-xl-3">
    <div className="bg-white p-3 rounded-4 shadow-sm border border-light d-flex flex-column gap-2">
      <div className="d-flex justify-content-between align-items-center">
        <div className="p-2 rounded-3" style={{ backgroundColor: fondo, fontSize: "18px" }}>{icono}</div>
        <span className="badge rounded-pill fw-normal px-2 py-1" style={{ backgroundColor: fondo, color: colorBadge }}>
          {badge}
        </span>
      </div>
      <div>
        <h2 className="fw-bold m-0" style={{ color: colorValor }}>{valor}</h2>
        <small className="text-muted">{titulo}</small>
      </div>
    </div>
  </div>
);

export const EncabezadoPagina = ({ icono, titulo, subtitulo, children }) => (
  <div className="d-flex justify-content-between align-items-center">
    <div className="d-flex align-items-center gap-3">
      <div
        className="rounded-3 d-flex align-items-center justify-content-center shadow-sm"
        style={{ width: "48px", height: "48px", backgroundColor: "#eff6ff", fontSize: "24px" }}
      >
        {icono}
      </div>
      <div>
        <h3 className="fw-bold m-0" style={{ color: "#0f172a", fontSize: "22px" }}>{titulo}</h3>
        <span className="text-muted small">{subtitulo}</span>
      </div>
    </div>
    <div className="d-flex gap-2">{children}</div>
  </div>
);

export const Pildora = ({ fondo, color, children }) => (
  <span className="px-3 py-2 rounded-pill small fw-semibold" style={{ backgroundColor: fondo, color }}>{children}</span>
);

export const Filtros = ({ opciones, valor, onCambio }) => (
  <div className="d-flex gap-1 bg-light p-1 rounded-pill border">
    {opciones.map((tab) => {
      const activo = valor === tab;
      return (
        <button
          key={tab}
          type="button"
          onClick={() => onCambio(tab)}
          className="btn btn-sm rounded-pill fw-semibold border-0 px-3"
          style={{ backgroundColor: activo ? "#1d3b8f" : "transparent", color: activo ? "#ffffff" : "#64748b", fontSize: "12px" }}
        >
          {tab}
        </button>
      );
    })}
  </div>
);

export const CajaBusqueda = ({ valor, onCambio, placeholder }) => (
  <div className="position-relative">
    <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{ fontSize: "13px" }}></i>
    <input
      type="text"
      className="form-control form-control-sm ps-5 bg-light border-0 rounded-pill"
      placeholder={placeholder}
      value={valor}
      onChange={(e) => onCambio(e.target.value)}
      style={{ width: "180px", fontSize: "13px" }}
    />
  </div>
);

export const Paginacion = ({ pagina, totalPaginas, onCambio }) => (
  <div className="d-flex gap-1">
    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => onCambio(n)}
        className="btn btn-sm fw-bold d-flex align-items-center justify-content-center"
        style={{
          width: "32px",
          height: "32px",
          backgroundColor: n === pagina ? "#1e3a8a" : "#eff6ff",
          color: n === pagina ? "#ffffff" : "#0d6efd",
          borderRadius: "8px",
          border: "none"
        }}
      >
        {n}
      </button>
    ))}
  </div>
);

export const Avatar = ({ texto, color = "#2563eb" }) => (
  <div
    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
    style={{ width: "32px", height: "32px", backgroundColor: color, fontSize: "11px", flexShrink: 0 }}
  >
    {texto}
  </div>
);

export const estiloBotonSecundario = { backgroundColor: "#f1f5f9", border: "none", fontSize: "14px" };
export const estiloBotonAzul = { backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", fontSize: "14px" };
export const estiloBotonGuardar = { backgroundColor: "#10b981", border: "none", fontSize: "14px" };
