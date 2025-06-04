import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiEdit,
  FiArrowLeft,
} from "react-icons/fi";
import { FaCube } from "react-icons/fa";

import "./PerfilStyle.css";

const Perfil = () => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const idUsuario = localStorage.getItem("user_id");
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    apellido1: "",
    apellido2: "",
    Telefono: "",
    Direccion: "",
  });

  useEffect(() => {
    if (!idUsuario) {
      Swal.fire({
        icon: "error",
        title: "Acceso restringido",
        text: "Debes iniciar sesión para ver esta información.",
        willClose: () => navigate("/login"),
      });
      return;
    }
    cargarInformacionPersonal();
  }, [idUsuario, navigate]);

  const cargarInformacionPersonal = async () => {
    try {
      const response = await fetch(
        `http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/getUsuarioById.php?idUsuario=${idUsuario}`
      );
      const data = await response.json();

      if (data.status !== "success")
        throw new Error(data.message || "Error al cargar datos");
      setUsuario(data.usuario);
      setForm({
        nombre: data.usuario.nombre,
        apellido1: data.usuario.apellido1,
        apellido2: data.usuario.apellido2,
        Telefono: data.usuario.Telefono || "",
        Direccion: data.usuario.Direccion || "",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  const guardarCambios = async () => {
     if (!/^\d{4}-\d{4}$/.test(form.Telefono)) {
    Swal.fire("Error", "El teléfono debe tener el formato 0000-0000.", "error");
    return;
  }
    try {
      const response = await fetch(
        "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/updatePerfil.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idUsuario,
            ...form,
          }),
        }
      );

      const result = await response.json();
      if (result.status === "success") {
        Swal.fire("Éxito", "Perfil actualizado correctamente", "success");
        setShowModal(false);
        cargarInformacionPersonal(); // Recargar datos
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  if (loading) {
     return (
        <div className="fullscreen-loading">
          <div className="spinner-container">
            <FaCube className="cube-spinner" />
            <FaCube className="cube-spinner" />
          </div>
          <h2 className="loading-text">Cargando tu Perfil</h2>
          <p className="loading-subtext" style={{color:'black'}}>Estamos preparando todos los detalles...</p>
        </div>
      );
  }

  if (!usuario) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          No se encontraron datos del usuario.
        </div>
      </div>
    );
  }

  return (
    <div className="perfil-background">
      <div className="container py-5">
        <div className="row">
          {/* Perfil */}
          <div className="col-md-8 fade-up">
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-primary2 text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <button
                    className="btn btn-light btn-sm"
                    onClick={() => navigate(-1)}
                  >
                    <FiArrowLeft className="me-1" /> Volver
                  </button>
                  <h3 className="mb-0">Mi Perfil</h3>
                  <button
                    className="btn btn-light btn-sm"
                    onClick={() => setShowModal(true)}
                  >
                    <FiEdit className="me-1" /> Editar
                  </button>
                </div>
              </div>

              <div className="card-body">
                <div className="row">
                  {/* Avatar e info básica */}
                  <div className="col-md-4 text-center mb-4 mb-md-0">
                    <div className="avatar-container mb-3">
                      <div className="avatar bg-secondary text-white">
                        {usuario.nombre.charAt(0)}
                        {usuario.apellido1.charAt(0)}
                      </div>
                    </div>
                    <h4 className="mb-1">
                      {usuario.nombre} {usuario.apellido1}
                    </h4>
                    <span className="badge bg-info text-dark">
                      {usuario.Rol}
                    </span>
                  </div>

                  {/* Detalles */}
                  <div className="col-md-8">
                    <div className="info-item">
                      <FiUser className="icon" />
                      <div>
                        <h6>Nombre completo</h6>
                        <p>
                          {usuario.nombre} {usuario.apellido1}{" "}
                          {usuario.apellido2}
                        </p>
                      </div>
                    </div>

                    <div className="info-item">
                      <FiMail className="icon" />
                      <div>
                        <h6>Correo electrónico</h6>
                        <p>{usuario.email}</p>
                      </div>
                    </div>

                    <div className="info-item">
                      <FiPhone className="icon" />
                      <div>
                        <h6>Teléfono</h6>
                        <p>
                          {usuario.Telefono || (
                            <span className="text-muted">No registrado</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="info-item">
                      <FiMapPin className="icon" />
                      <div>
                        <h6>Dirección</h6>
                        <p>
                          {usuario.Direccion || (
                            <span className="text-muted">No registrada</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="info-item">
                      <FiCalendar className="icon" />
                      <div>
                        <h6>Miembro desde</h6>
                        <p>
                          {new Date(usuario.FechaCreacion).toLocaleDateString(
                            "es-ES",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logro Medalla */}
          <div className="col-md-4 fade-up">
            <div className="card shadow-sm mb-4">
              <div className="card-body text-center">
                <h6 className="text-muted">Medalla</h6>
                {(() => {
                  const fechaCreacion = new Date(usuario.FechaCreacion);
                  const ahora = new Date();
                  const mesesDeAntiguedad =
                    (ahora.getFullYear() - fechaCreacion.getFullYear()) * 12 +
                    (ahora.getMonth() - fechaCreacion.getMonth());

                  let medallaSrc = "";
                  let medallaNombre = "";

                  if (mesesDeAntiguedad >= 12) {
                    medallaSrc =
                      "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/uploads/Medal%20gold.png";
                    medallaNombre = "Medalla de Oro";
                  } else if (mesesDeAntiguedad >= 6) {
                    medallaSrc =
                      "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/uploads/Medal%20Silver.png";
                    medallaNombre = "Medalla de Plata";
                  } else {
                    medallaSrc =
                      "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/uploads/Medal%20bronce.png";
                    medallaNombre = "Medalla de Bronce";
                  }

                  return (
                    <>
                      <img
                        src={medallaSrc}
                        alt={medallaNombre}
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "contain",
                          marginBottom: "10px",
                        }}
                      />
                      <p className="mb-0">{medallaNombre}</p>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Frase motivadora */}
        <div className="text-center text-muted mt-5">
          <em>“Cada cliente feliz es un logro para nosotros.”</em>
        </div>
      </div>
      {/* Modal para editar perfil */}
      {usuario && (
        <div
          className={`modal fade ${showModal ? "show d-block" : ""}`}
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Perfil</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.nombre}
                    onChange={(e) =>
                      setForm({ ...form, nombre: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Apellido 1</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.apellido1}
                    onChange={(e) =>
                      setForm({ ...form, apellido1: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Apellido 2</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.apellido2}
                    onChange={(e) =>
                      setForm({ ...form, apellido2: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="text"
                    className={`form-control ${
                      form.Telefono && !/^\d{4}-\d{4}$/.test(form.Telefono)
                        ? "is-invalid"
                        : ""
                    }`}
                    value={form.Telefono}
                    onChange={(e) =>
                      setForm({ ...form, Telefono: e.target.value })
                    }
                  />
                  {form.Telefono && !/^\d{4}-\d{4}$/.test(form.Telefono) && (
                    <div className="invalid-feedback">
                      El teléfono debe tener el formato 0000-0000.
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Dirección</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.Direccion}
                    onChange={(e) =>
                      setForm({ ...form, Direccion: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  style={{ backgroundColor: "#1a1a1a" }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={guardarCambios}
                  style={{ backgroundColor: "#ff6347" }}
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;
