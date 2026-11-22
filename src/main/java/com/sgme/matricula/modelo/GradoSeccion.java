package com.sgme.matricula.modelo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "grado_seccion",
        uniqueConstraints = @UniqueConstraint(name = "uq_grado_seccion", columnNames = {"grado", "seccion"}))
public class GradoSeccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "grado", nullable = false, length = 20)
    private String grado;

    @Column(name = "seccion", nullable = false, length = 10)
    private String seccion;

    public String obtenerDescripcion() {
        return grado + " - " + seccion;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getGrado() { return grado; }
    public void setGrado(String grado) { this.grado = grado; }
    public String getSeccion() { return seccion; }
    public void setSeccion(String seccion) { this.seccion = seccion; }
}
