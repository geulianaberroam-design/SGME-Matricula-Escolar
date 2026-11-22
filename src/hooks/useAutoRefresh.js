import { useEffect, useRef } from "react";

/**
 * Ejecuta `cargar` al montar el componente y la vuelve a ejecutar:
 *  - cada `intervaloMs` milisegundos (solo si la pestaña está visible),
 *  - al volver a la pestaña o a la ventana.
 * Así las pantallas siempre muestran lo que hay en PostgreSQL, sin recargar la página.
 */
export default function useAutoRefresh(cargar, intervaloMs = 15000) {
  const referencia = useRef(cargar);
  referencia.current = cargar;

  useEffect(() => {
    const ejecutar = () => {
      if (document.visibilityState === "visible") {
        referencia.current();
      }
    };

    referencia.current();
    const temporizador = setInterval(ejecutar, intervaloMs);
    window.addEventListener("focus", ejecutar);
    document.addEventListener("visibilitychange", ejecutar);

    return () => {
      clearInterval(temporizador);
      window.removeEventListener("focus", ejecutar);
      document.removeEventListener("visibilitychange", ejecutar);
    };
  }, [intervaloMs]);
}
