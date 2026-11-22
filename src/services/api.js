import axios from "axios";

// URL de la API Spring Boot. Se puede cambiar creando un archivo .env con:
//   VITE_API_URL=http://localhost:8080/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  timeout: 15000
});

// Siempre deja en error.mensajeUsuario el motivo REAL del fallo, para mostrarlo en las alertas.
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (error.response) {
      error.mensajeUsuario =
        error.response.data?.mensaje ||
        `El servidor respondió con error ${error.response.status}.`;
    } else {
      error.mensajeUsuario =
        "No se pudo conectar con el servidor. Verifica que la API (Spring Boot) esté ejecutándose en el puerto 8080.";
    }
    return Promise.reject(error);
  }
);

export default api;
