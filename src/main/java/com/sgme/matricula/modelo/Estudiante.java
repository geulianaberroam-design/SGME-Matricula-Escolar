package com.sgme.matricula.modelo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;

@Entity
@Table(name = "estudiante")
public class Estudiante extends Persona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "fecha_nac")
    private LocalDate fechaNac;

    @Column(name = "direccion", length = 200)
    private String direccion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_apoderado", nullable = false)
    private Apoderado apoderado;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public LocalDate getFechaNac() { return fechaNac; }
    public void setFechaNac(LocalDate fechaNac) { this.fechaNac = fechaNac; }
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    public Apoderado getApoderado() { return apoderado; }
    public void setApoderado(Apoderado apoderado) { this.apoderado = apoderado; }
}
