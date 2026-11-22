package com.sgme.matricula.modelo;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;

/** Datos básicos de una persona (clase padre de Apoderado y Estudiante). */
@MappedSuperclass
public abstract class Persona {

    @Column(name = "dni", nullable = false, length = 8)
    private String dni;

    @Column(name = "nombres", nullable = false, length = 100)
    private String nombres;

    @Column(name = "apellidos", nullable = false, length = 100)
    private String apellidos;

    @Column(name = "telefono", length = 20)
    private String telefono;

    @Column(name = "email", length = 150)
    private String email;

    public String obtenerNombreCompleto() {
        return nombres + " " + apellidos;
    }

    public String getDni() { return dni; }
    public void setDni(String dni) { this.dni = dni; }
    public String getNombres() { return nombres; }
    public void setNombres(String nombres) { this.nombres = nombres; }
    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
