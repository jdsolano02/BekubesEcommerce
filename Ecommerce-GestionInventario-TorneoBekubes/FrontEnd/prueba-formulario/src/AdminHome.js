import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styleAdmin.css"; // Importa el archivo CSS


const AdminHome = () => {
  const navigate = useNavigate();
  const adminEmail = localStorage.getItem("email");

  const handleLogout = async () => {
    await fetch("http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/logout.php");
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="/admin-home">Panel Administrador</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={() => navigate("/usuarios")}>Usuarios</button>
              </li>
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={() => navigate("/register-admin")}>Crear Usuarios</button>
              </li>
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={() => navigate("/inventario")}>Inventario</button>
              </li>
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={() => navigate("/gestion-productos")}>Gestionar Productos</button>
              </li>
            </ul>
            <span className="navbar-text text-white me-3">Bienvenido, {adminEmail}</span>
            <button className="btn btn-danger" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
        <h1>Gestiona. Vende. Resuelve.</h1>
        <p>La plataforma definitiva para administrar tu ecommerce de cubos Rubik.</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="feature-card">
              <h2>Gestión de Inventario</h2>
              <p>Controla tu stock de cubos Rubik de manera eficiente.</p>
              <img
                src="https://img.icons8.com/?size=100&id=V82gwIqAn8NY&format=png&color=000000" 
                alt="gestión"
                className="img-fluid"
              />
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="feature-card">
              <h2>Ventas en Tiempo Real</h2>
              <p>Monitorea y gestiona tus ventas en tiempo real.</p>
              <img
                src="https://img.icons8.com/?size=100&id=MnYyIWSrPXYw&format=png&color=000000" 
                alt="gestión"
                className="img-fluid"
              />
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="feature-card">
              <h2>Colaboración en Equipo</h2>
              <p>Trabaja con tu equipo de manera colaborativa y eficiente.</p>
              <img
                src="https://img.icons8.com/?size=100&id=lC0bpzpRcdWI&format=png&color=000000" 
                alt="gestión"
                className="img-fluid"
              />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminHome;