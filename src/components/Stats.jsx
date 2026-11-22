import React, { useState } from "react";
import api from "../services/api";

import useAutoRefresh from "../hooks/useAutoRefresh";
import { formatearMonto } from "../utils/estados";

export default function Stats() {
  const [resumen, setResumen] = useState(null);

  // Datos en vivo: los totales se calculan en PostgreSQL y se refrescan solos cada 10 s.
  const cargarDatos = async () => {
    try {
      const respuesta = await api.get("/dashboard/resumen");
      setResumen(respuesta.data);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error.mensajeUsuario || error);
    }
  };

  useAutoRefresh(cargarDatos, 10000);

  const r = resumen || {};
  const totalEstudiantes = r.total_estudiantes ?? 0;
  const matriculasActivas = r.matriculas_activas ?? 0;
  const porcentajeMatriculados = r.porcentaje_matriculados ?? 0;
  const totalPagos = r.total_pagos ?? 0;
  const montoTotalPagos = Number(r.monto_cobrado ?? 0);
  const documentosPendientes = r.documentos_pendientes ?? 0;
  const documentosObservados = r.documentos_observados ?? 0;

  const statsData = [
    {
      id: 1,
      value: totalEstudiantes,
      valueColor: "#1e293b",
      label: "Total Estudiantes",
      badgeText: `${r.total_apoderados ?? 0} apoderados`,
      badgeBg: "#eff6ff",
      badgeColor: "#2563eb",
      iconClass: "bi bi-person-fill",
      iconBg: "#e0e7ff",
      iconColor: "#4338ca",
    },
    {
      id: 2,
      value: matriculasActivas,
      valueColor: "#16a34a",
      label: "Matrículas Activas",
      badgeText: `${porcentajeMatriculados}% del total`,
      badgeBg: "#dcfce7",
      badgeColor: "#15803d",
      iconClass: "bi bi-clipboard-check-fill",
      iconBg: "#dcfce7",
      iconColor: "#166534",
    },
    {
      id: 3,
      value: totalPagos,
      valueColor: "#d97706",
      label: "Pagos Registrados",
      badgeText: `${formatearMonto(montoTotalPagos)} cobrado`,
      badgeBg: "#fef3c7",
      badgeColor: "#b45309",
      iconClass: "bi bi-credit-card-fill",
      iconBg: "#fef3c7",
      iconColor: "#92400e",
    },
    {
      id: 4,
      value: documentosPendientes,
      valueColor: "#dc2626",
      label: "Docs. por Validar",
      badgeText: `${documentosObservados} con observaciones`,
      badgeBg: "#ffe4e6",
      badgeColor: "#be123c",
      iconClass: "bi bi-folder-fill",
      iconBg: "#ffe4e6",
      iconColor: "#9f1239",
    },
  ];

  return (
    <div className="row g-3">

      {statsData.map((stat) => (

        <div
          className="col-12 col-sm-6 col-xl-3"
          key={stat.id}
        >

          <div
            className="bg-white p-4 shadow-sm border-0 d-flex flex-column justify-content-between h-100"
            style={{ borderRadius: "20px" }}
          >

            {/* Fila Superior: Ícono y Badge */}

            <div className="d-flex justify-content-between align-items-center mb-3">

              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{
                  width: "44px",
                  height: "44px",
                  backgroundColor: stat.iconBg,
                  color: stat.iconColor,
                  fontSize: "20px"
                }}
              >
                <i className={stat.iconClass}></i>
              </div>

              <span
                className="px-3 py-1 rounded-pill small fw-semibold"
                style={{
                  backgroundColor: stat.badgeBg,
                  color: stat.badgeColor,
                  fontSize: "12px"
                }}
              >
                {stat.badgeText}
              </span>

            </div>

            {/* Fila Inferior: Número y Leyenda */}

            <div>

              <h2
                className="fw-bold m-0"
                style={{
                  color: stat.valueColor,
                  fontSize: "28px",
                  lineHeight: "1.2"
                }}
              >
                {stat.value}
              </h2>

              <small
                className="text-muted"
                style={{ fontSize: "13px" }}
              >
                {stat.label}
              </small>

            </div>

          </div>

        </div>

      ))}

    </div>
  );
}