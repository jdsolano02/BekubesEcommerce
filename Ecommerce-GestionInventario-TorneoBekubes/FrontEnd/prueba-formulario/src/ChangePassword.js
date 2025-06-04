import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener el token de la URL
  const token = new URLSearchParams(location.search).get("token");

  const isStrongPassword = (password) => {
    // Mínimo 12 caracteres, al menos 1 mayúscula, 1 número y 1 carácter especial
    const strongRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{12,}$/;
    return strongRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!isStrongPassword(newPassword)) {
      setError(
        "La contraseña debe tener al menos 12 caracteres, incluyendo 1 mayúscula, 1 número y 1 carácter especial."
      );
      return;
    }

    try {
      const response = await fetch(
        "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/reset-password.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess(data.success);
        Swal.fire({
          icon: "success",
          title: "Contraseña restablecida",
          text: data.success,
        }).then(() => {
          navigate("/login"); // Redirige al login después de cambiar la contraseña
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
      setError("Error al restablecer la contraseña. Inténtalo nuevamente.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al restablecer la contraseña. Inténtalo nuevamente.",
      });
    }
  };

  return (
    <div className="change-password d-flex justify-content-center align-items-center min-vh-100 bg-dark">
      <div
        className="card shadow-lg p-5 rubik-card"
        style={{ width: "450px", borderRadius: "15px" }}
      >
        <h2 className="text-center mb-4 rubik-title">Cambiar Contraseña</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label htmlFor="newPassword">Nueva Contraseña</label>
            <input
              type="password"
              className="form-control rubik-input"
              id="newPassword"
              placeholder="Introduce tu nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <small className="form-text text-muted">
              La contraseña debe tener al menos 12 caracteres, incluyendo 1
              mayúscula, 1 número y 1 carácter especial.
            </small>
          </div>
          <div className="form-group mb-3">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              type="password"
              className="form-control rubik-input"
              id="confirmPassword"
              placeholder="Confirma tu nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="d-flex justify-content-center">
            <button type="submit" className="btn rubik-btn btn-block">
              Cambiar Contraseña
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;