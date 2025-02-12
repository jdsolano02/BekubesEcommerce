import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css"; 
import { FaEye, FaEyeSlash } from "react-icons/fa"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false); 
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.status === "success") {
        localStorage.setItem("role", data.role);
        localStorage.setItem("email", email);

        if (data.role === "Administrador") {
          navigate("/admin-home");
        } else if (data.role === "Cliente") {
          navigate("/client-home");
        }
      } else {
        setError(data.message); 
      }
    } catch (err) {
      setError("Error al iniciar sesión. Inténtalo nuevamente.");
    }
  };

  return (
    <div className="login d-flex justify-content-center align-items-center min-vh-100 bg-dark">
      <div className="card shadow-lg p-5 rubik-card" style={{ width: '450px', borderRadius: '15px' }}>
        <h2 className="text-center mb-4 rubik-title">¡Bienvenido a Bekubes!</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleLogin}>
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
          <div className="form-group position-relative mb-3">
            <label htmlFor="password">Contraseña</label>
            <input
              type={passwordVisible ? "text" : "password"} 
              className="form-control rubik-input"
              id="password"
              placeholder="Introduce tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="position-absolute end-0 translate-middle-y me-3 cursor-pointer"
              onClick={() => setPasswordVisible(!passwordVisible)} 
              style={{ fontSize: '1.7em', top: '47px'}} 
            >
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <div className="d-flex justify-content-center">
            <button type="submit" className="btn rubik-btn btn-block">Ingresar</button>
          </div>
        </form>
        <div className="mt-3 text-center">
          <p>
            ¿No tienes cuenta?{" "}
            <button
              className="btn btn-link rubik-link p-0"
              onClick={() => navigate("/register-form")}
            >
              Registrarse
            </button>
          </p>
          <p>
            ¿Olvidaste tu contraseña?{" "}
            <button
              className="btn btn-link rubik-link p-0"
              onClick={() => navigate("/reset-password")}
            >
              Restablecer Contraseña
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;