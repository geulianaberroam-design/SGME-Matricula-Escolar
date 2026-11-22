// Reglas compartidas para interpretar los estados que vienen de la base de datos.

const normalizar = (texto) => (texto || "").toString().trim().toLowerCase();

/** Una matrícula cuenta como vigente si está matriculada, activa o aprobada. */
export const esMatriculaActiva = (estado) =>
  ["matriculado", "activo", "activa", "aprobada", "aprobado"].includes(normalizar(estado));

export const esMatriculaPendiente = (estado) => normalizar(estado) === "pendiente";

/** Color del texto del estado de una matrícula. */
export const colorEstadoMatricula = (estado) => {
  if (esMatriculaActiva(estado)) return "#16a34a";
  if (esMatriculaPendiente(estado)) return "#d97706";
  if (["observado", "observada", "rechazada", "rechazado", "anulada", "anulado"].includes(normalizar(estado))) {
    return "#dc2626";
  }
  return "#64748b";
};

/** "1" -> "1°" ; "1°" -> "1°" ; "Inicial" -> "Inicial" */
export const etiquetaGrado = (grado) => {
  const texto = (grado ?? "").toString().trim();
  const numero = parseInt(texto, 10);
  return Number.isNaN(numero) ? texto : `${numero}°`;
};

/** Iniciales para el avatar: "Camila Ríos" -> "CR" */
export const iniciales = (nombres, apellidos) => {
  const n = (nombres || "").trim().split(/\s+/)[0] || "";
  const a = (apellidos || "").trim().split(/\s+/)[0] || "";
  return `${n.charAt(0)}${a.charAt(0)}`.toUpperCase();
};

/** Fecha ISO (AAAA-MM-DD) -> "02 mar. 2025" */
export const formatearFecha = (fecha) => {
  if (!fecha) return "-";
  const f = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(f.getTime())) return "-";
  return f.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
};

export const formatearMonto = (monto) =>
  `S/ ${Number(monto || 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const hoyISO = () => {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
};
