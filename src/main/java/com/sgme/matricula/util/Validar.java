package com.sgme.matricula.util;

import com.sgme.matricula.excepcion.NegocioException;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Locale;

/** Validaciones y normalizaciones reutilizables por los servicios. */
public final class Validar {

    private Validar() {
    }

    /** Texto obligatorio, sin espacios sobrantes y con longitud máxima. */
    public static String requerido(String valor, String campo, int max) {
        if (valor == null || valor.isBlank()) {
            throw new NegocioException("El campo '" + campo + "' es obligatorio.");
        }
        return limitar(valor.trim(), campo, max);
    }

    /** Texto opcional: devuelve null si viene vacío. */
    public static String opcional(String valor, String campo, int max) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        return limitar(valor.trim(), campo, max);
    }

    private static String limitar(String valor, String campo, int max) {
        if (valor.length() > max) {
            throw new NegocioException("El campo '" + campo + "' admite como máximo " + max + " caracteres.");
        }
        return valor;
    }

    public static String dni(String valor) {
        String limpio = requerido(valor, "DNI", 8);
        if (!limpio.matches("\\d{8}")) {
            throw new NegocioException("El DNI debe tener exactamente 8 dígitos numéricos.");
        }
        return limpio;
    }

    public static LocalDate fechaOpcional(String valor, String campo) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(valor.trim());
        } catch (DateTimeParseException e) {
            throw new NegocioException("La fecha '" + campo + "' no es válida (use el formato AAAA-MM-DD).");
        }
    }

    /** Fecha opcional con valor por defecto (hoy) cuando no se envía. */
    public static LocalDate fechaOHoy(String valor, String campo) {
        LocalDate fecha = fechaOpcional(valor, campo);
        return fecha != null ? fecha : LocalDate.now();
    }

    /** Convierte null en "" (React espera textos, no null, en los inputs). */
    public static String vacioSiNull(String valor) {
        return valor == null ? "" : valor;
    }

    /** "matriculado" -> "Matriculado" (equivale a strip().title() de Python para una palabra). */
    public static String capitalizar(String valor) {
        String t = valor.trim();
        return t.isEmpty() ? t : t.substring(0, 1).toUpperCase(Locale.ROOT) + t.substring(1).toLowerCase(Locale.ROOT);
    }

    /**
     * Devuelve el valor canónico de una lista de opciones, ignorando mayúsculas y tildes.
     * Si no se envía nada usa el valor por defecto; si no coincide lanza error.
     */
    public static String opcion(String valor, List<String> permitidos, String porDefecto, String campo) {
        if (valor == null || valor.isBlank()) {
            return porDefecto;
        }
        String buscado = plano(valor);
        for (String p : permitidos) {
            if (plano(p).equals(buscado)) {
                return p;
            }
        }
        throw new NegocioException("Valor no válido para '" + campo + "'. Opciones: " + String.join(", ", permitidos) + ".");
    }

    public static String plano(String s) {
        String sinTildes = Normalizer.normalize(s.trim(), Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return sinTildes.toLowerCase(Locale.ROOT);
    }
}
