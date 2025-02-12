import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido1: "",
    apellido2: "",
    email: "",
    password: "",
    rol: "Cliente",
  });
  const [message, setMessage] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/RegistroUsuario.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

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
          rol: "Cliente",
        });
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      setMessage(`Error al conectar con el servidor: ${error.message}`);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-lg p-4" style={{ width: "400px", borderRadius: "20px" }}>
        <h2 className="text-center mb-4" style={{ color: "#F39C12" }}>Registro de Usuario</h2>
        <form onSubmit={handleSubmit}>
          {/* Nombre */}
          <div className="mb-3">
            <label htmlFor="nombre" className="form-label">Nombre</label>
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
            <label htmlFor="apellido1" className="form-label">Primer Apellido</label>
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
            <label htmlFor="apellido2" className="form-label">Segundo Apellido</label>
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
            <label htmlFor="email" className="form-label">Email</label>
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
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              type={passwordVisible ? "text" : "password"}
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span
              className="position-absolute end-0 translate-middle-y me-3 cursor-pointer"
              onClick={() => setPasswordVisible(!passwordVisible)}
              style={{ fontSize: "1.5em", top: '50px'}}
            >
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Mensaje de error o éxito */}
          {message && <p className="text-center mt-3" style={{ color: "#E74C3C" }}>{message}</p>}

          {/* Botón de envío */}
          <button type="submit" className="btn btn-warning w-100 mt-4" style={{ fontSize: "1.1em", borderRadius: "10px" }}>
            Registrar
          </button>
        </form>

        {/* Enlace a la página de inicio de sesión */}
        <div className="text-center mt-3">
          <p>
            ¿Ya tienes una cuenta?{" "}
            <button
              className="btn btn-link p-0"
              onClick={() => window.location.href = "/login"}
              style={{ color: "#F39C12" }}
            >
              Iniciar sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;