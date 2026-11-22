package com.sgme.matricula.config;

import java.time.Year;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuración global del sistema (equivale al Singleton SistemaConfig de Python).
 * Spring crea una única instancia (singleton) y la llena desde application.properties
 * (prefijo "sgme").
 */
@Component
@ConfigurationProperties(prefix = "sgme")
public class SistemaConfig {

    private String nombreSistema = "SGME - Sistema de Gestión de Matrícula Escolar";
    private String version = "1.0.0";
    private String institucion = "Institución Educativa SGME";
    private int anioEscolar = 0;
    private String moneda = "PEN";
    private Usuario usuario = new Usuario();

    /** Año escolar configurado; si es 0 se usa el año actual del servidor. */
    public int getAnioEscolar() {
        return anioEscolar > 0 ? anioEscolar : Year.now().getValue();
    }

    public String getNombreSistema() { return nombreSistema; }
    public void setNombreSistema(String nombreSistema) { this.nombreSistema = nombreSistema; }
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
    public String getInstitucion() { return institucion; }
    public void setInstitucion(String institucion) { this.institucion = institucion; }
    public void setAnioEscolar(int anioEscolar) { this.anioEscolar = anioEscolar; }
    public String getMoneda() { return moneda; }
    public void setMoneda(String moneda) { this.moneda = moneda; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    /** Usuario que se muestra en la cabecera (el sistema aún no tiene login). */
    public static class Usuario {
        private String nombre = "Usuario";
        private String cargo = "";

        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public String getCargo() { return cargo; }
        public void setCargo(String cargo) { this.cargo = cargo; }
    }
}
