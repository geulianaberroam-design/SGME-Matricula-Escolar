import { useEffect, useState } from "react";
import api from "../services/api";

// Valores por defecto mientras responde la API (el año sale del reloj del equipo).
const PORDEFECTO = {
  nombre: "Sistema de Gestión de Matrícula Escolar",
  institucion: "",
  anio_escolar: new Date().getFullYear(),
  usuario: { nombre: "", cargo: "" }
};

let cache = null;

/** Datos generales del sistema (institución, año escolar, usuario) desde GET /api/sistema. */
export default function useSistema() {
  const [sistema, setSistema] = useState(cache || PORDEFECTO);

  useEffect(() => {
    if (cache) return;
    api
      .get("/sistema")
      .then((respuesta) => {
        cache = respuesta.data;
        setSistema(cache);
      })
      .catch(() => {});
  }, []);

  return sistema;
}
