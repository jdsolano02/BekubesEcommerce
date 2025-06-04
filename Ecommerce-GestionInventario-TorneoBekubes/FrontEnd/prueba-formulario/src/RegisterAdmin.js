import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido1: "",
    apellido2: "",
    email: "",
    password: "",
    rol: "", // Rol inicial vacío
  });
  const [message, setMessage] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const adminEmail = localStorage.getItem("email");
  const [passwordError, setPasswordError] = useState("");

  const isStrongPassword = (password) => {
    // Mínimo 12 caracteres, al menos 1 mayúscula, 1 número y 1 carácter especial
    const strongRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{12,}$/;
    return strongRegex.test(password);
  };
  // hacer el logout
  const handleLogout = async () => {
    await fetch(
      "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/logout.php"
    );
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "password") {
      if (!isStrongPassword(value) && value.length > 0) {
        setPasswordError(
          "La contraseña debe tener mínimo 12 caracteres, incluir mayúsculas, números y un carácter especial"
        );
      } else {
        setPasswordError("");
      }
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isStrongPassword(formData.password)) {
      setPasswordError(
        "La contraseña no cumple con los requisitos de seguridad"
      );
      return;
    }
    console.log("Datos enviados:", formData);

    try {
      const response = await fetch(
        "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/RegistroAdmin.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.statusText}`);
      }

      const data = await response.json();
      setMessage(data.message);

      if (data.status === "success") {
        setFormData({
          nombre: "",
          apellido1: "",
          apellido2: "",
          email: "",
          password: "",
          rol: "", // Reiniciamos el campo "rol"
        });
      }
    } catch (error) {
      console.error("Error en la solicitud:", error); // Muestra el error en la consola
      setMessage(`Error al conectar con el servidor: ${error.message}`);
    }
  };

  return (
    <>
      <div>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container-fluid">
            <a className="navbar-brand" href="/admin-home">
              Panel Administrador
            </a>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav me-auto">
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    onClick={() => navigate("/usuarios")}
                  >
                    Usuarios
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    onClick={() => navigate("/register-admin")}
                  >
                    Crear Usuarios
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    onClick={() => navigate("/inventario")}
                  >
                    Inventario
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    onClick={() => navigate("/gestion-productos")}
                  >
                    Gestionar Productos
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    onClick={() => navigate("/pedidos-admin")}
                  >
                    Pedidos Usuarios
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    onClick={() => navigate("/admin-torneo")}
                  >
                    Torneos
                  </button>
                </li>
              </ul>
              <span className="navbar-text text-white me-3">
                Bienvenido, {adminEmail}
              </span>
              <button className="btn btn-danger" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>
          </div>
        </nav>
      </div>

      <div className="container3 d-flex justify-content-center align-items-center min-vh-100">
        <div
          className="card shadow-lg p-4"
          style={{ width: "400px", borderRadius: "20px" }}
        >
          <div
            className="card-header text-white"
            style={{
              backgroundImage:
                "url('https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZmJkdndhNnp6bWJ3ZGt3NWhhMmRybXlrdHlxZG5mZGNhZ3E1MjN1byZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/0CziCeUfvLnxwJW3pa/giphy.gif')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <h4 style={{ textAlign: "center" }}>Registrar Usuario</h4>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {/* Nombre */}
              <div className="mb-3">
                <label htmlFor="nombre" className="form-label">
                  Nombre
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  className="form-control"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Primer Apellido */}
              <div className="mb-3">
                <label htmlFor="apellido1" className="form-label">
                  Primer Apellido
                </label>
                <input
                  type="text"
                  id="apellido1"
                  name="apellido1"
                  className="form-control"
                  value={formData.apellido1}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Segundo Apellido */}
              <div className="mb-3">
                <label htmlFor="apellido2" className="form-label">
                  Segundo Apellido
                </label>
                <input
                  type="text"
                  id="apellido2"
                  name="apellido2"
                  className="form-control"
                  value={formData.apellido2}
                  onChange={handleChange}
                />
              </div>

              {/* Email */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Contraseña */}
              <div className="mb-3 position-relative">
                <label htmlFor="password" className="form-label">
                  Contraseña
                </label>
                <input
                  type={passwordVisible ? "text" : "password"}
                  id="password"
                  name="password"
                  className={`form-control ${passwordError && "is-invalid"}`}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <span
                  className="position-absolute end-0 translate-middle-y me-3 cursor-pointer"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  style={{ fontSize: "1.5em", top: "50px" }}
                >
                  {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                </span>
                {passwordError && (
                  <div className="invalid-feedback">{passwordError}</div>
                )}
              </div>

              {/* Rol */}
              <div className="mb-3">
                <label htmlFor="rol" className="form-label">
                  Rol
                </label>
                <select
                  id="rol"
                  name="rol"
                  className="form-control"
                  value={formData.rol}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona un rol</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Cliente">Cliente</option>
                </select>
              </div>

              {/* Mensaje de error o éxito */}
              {message && (
                <p className="text-center mt-3" style={{ color: "#E74C3C" }}>
                  {message}
                </p>
              )}

              {/* Botón de envío */}
              <button
                type="submit"
                className="btn btn-warning w-100 mt-4"
                style={{
                  fontSize: "1.1em",
                  borderRadius: "10px",
                  backgroundColor: "#ff6347",
                  color: "white",
                }}
              >
                Registrar
              </button>
            </form>
          </div>
          {/* Enlace a la página de inicio de sesión */}
          <div className="text-center mt-3">
            <button
              className="btn btn-link p-0"
              onClick={() => (window.location.href = "/usuarios")}
              style={{ color: "#F39C12" }}
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterForm;
