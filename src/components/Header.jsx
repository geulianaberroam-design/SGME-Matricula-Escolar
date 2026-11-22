import React, { useEffect, useState } from "react";
import api from "../services/api";
import useAutoRefresh from "../hooks/useAutoRefresh";
import useSistema from "../hooks/useSistema";
import { iniciales } from "../utils/estados";

// El componente Header recibe dos propiedades:
// collapsed: indica si el menú está contraído.
// setCollapsed: permite cambiar el estado del menú.
function Header({ collapsed, setCollapsed }) {

  // ============================================================
  // DATOS EN VIVO
  // ============================================================
  const sistema = useSistema();

  // Reloj: se actualiza cada segundo, por lo que la fecha también cambia sola a medianoche.
  const [hoy, setHoy] = useState(new Date());
  useEffect(() => {
    const reloj = setInterval(() => setHoy(new Date()), 1000);
    return () => clearInterval(reloj);
  }, []);

  const fechaActual = hoy.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  const fechaFormateada =
    fechaActual.charAt(0).toUpperCase() + fechaActual.slice(1);
  const horaActual = hoy.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  // La campana muestra el punto rojo solo si hay algo pendiente en la base de datos.
  const [pendientes, setPendientes] = useState(0);
  useAutoRefresh(async () => {
    try {
      const { data } = await api.get("/dashboard/resumen");
      setPendientes((data.matriculas_pendientes || 0) + (data.documentos_pendientes || 0));
    } catch (error) {
      // sin conexión: se conserva el último valor
    }
  }, 10000);

  const nombreUsuario = sistema.usuario?.nombre || "Usuario";
  const cargoUsuario = sistema.usuario?.cargo || "";
  const [nombrePila, ...apellidosUsuario] = nombreUsuario.split(" ");

  return (
    <header
  className="d-flex justify-content-between align-items-center w-100 bg-white"
  style={{
    padding: "18px 24px",
    borderBottom: "1px solid #e5e7eb",
    minHeight: "86px"
  }}
>
      {/* ======================================================
          1. SECCIÓN IZQUIERDA
          Botón hamburguesa + información del sistema
      ====================================================== */}

      <div className="d-flex align-items-center">

        {/* Botón que colapsa/expande el menú lateral */}
        <button
          className="menu-btn me-3 p-0 border-0 bg-transparent"
          onClick={() => setCollapsed(!collapsed)}
          title="Alternar menú"
        >
          <i className="bi bi-list fs-2"></i>
        </button>


        {/* Información del sistema */}
        <div>

          <h4 className="m-0 fw-bold fs-5 text-dark">
            {sistema.nombre}
          </h4>

          <small className="text-muted">
            Año Escolar {sistema.anio_escolar}{sistema.institucion ? ` · ${sistema.institucion}` : ""}
          </small>

        </div>

      </div>


      {/* ======================================================
          2. SECCIÓN DERECHA
          Fecha + notificaciones + usuario
      ====================================================== */}

      <div className="d-flex align-items-center gap-3">

        {/* ====================================================
            FECHA ACTUAL
        ==================================================== */}

        <div className="bg-light px-3 py-2 rounded-3 text-secondary border d-flex align-items-center gap-2 small">

          <i className="bi bi-calendar3"></i>

          <span>
            {fechaFormateada} · {horaActual}
          </span>

        </div>


        {/* ====================================================
            NOTIFICACIONES
        ==================================================== */}

        <div className="position-relative cursor-pointer p-2 fs-5 text-secondary">

          <i className="bi bi-bell"></i>

          {/* Punto rojo */}
          <span className="position-absolute top-1 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">

            <span className="visually-hidden">
              Notificaciones no leídas
            </span>

          </span>

        </div>


        {/* ====================================================
            PERFIL DEL USUARIO
        ==================================================== */}

        <div className="d-flex align-items-center ms-2">

          {/* Avatar */}

          <div
            className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold me-2 position-relative"
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "#1d3b8f"
            }}
          >

            {iniciales(nombrePila, apellidosUsuario.join(" ")) || "U"}

            {/* Indicador de usuario conectado */}

            <span
              className="position-absolute bottom-0 end-0 p-1 bg-success border border-light rounded-circle"
              style={{
                width: "10px",
                height: "10px"
              }}
            ></span>

          </div>


          {/* Nombre y cargo */}

          <div className="d-none d-md-block text-start me-2">

            <div className="fw-bold fs-6 lh-1 text-dark">
              {nombreUsuario}
            </div>

            <small className="text-muted small">
              {cargoUsuario}
            </small>

          </div>


          {/* Flecha */}

          <i className="bi bi-chevron-down small text-muted"></i>

        </div>

      </div>

    </header>
  );
}

export default Header;