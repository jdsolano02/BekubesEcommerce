import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/EnviarCorreoPassword.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.success);
        Swal.fire({
          icon: "success",
          title: "Correo enviado",
          text: data.success,
        }).then(() => {
          navigate("/login");
        });
      } else {
        setError(data.error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.error,
        });
      }
    } catch (err) {
      setError("Error al enviar la solicitud. Inténtalo nuevamente.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al enviar la solicitud. Inténtalo nuevamente.",
      });
    }
  };

  return (
    <div className="reset-password d-flex justify-content-center align-items-center min-vh-100 bg-dark">
      <div className="card shadow-lg p-5 rubik-card" style={{ width: '450px', borderRadius: '15px' }}>
        <h2 className="text-center mb-4 rubik-title">Restablecer Contraseña</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              className="form-control rubik-input"
              id="email"
              placeholder="Introduce tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="d-flex justify-content-center">
            <button type="submit" className="btn rubik-btn btn-block">Enviar Correo</button>
          </div>
        </form>
        <div className="mt-3 text-center">
          <p>
            ¿Recordaste tu contraseña?{" "}
            <button
              className="btn btn-link rubik-link p-0"
              onClick={() => navigate("/login")}
            >
              Iniciar Sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;