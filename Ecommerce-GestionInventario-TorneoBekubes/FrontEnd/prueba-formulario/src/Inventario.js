import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styleAdmin.css"; 
const Inventario = () => { 
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
    <>
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
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={() => navigate("/pedidos-admin")}>Pedidos</button>
              </li>
            </ul>
            <span className="navbar-text text-white me-3">Bienvenido, {adminEmail}</span>
            <button className="btn btn-danger" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </div>
      </nav>
      </div>

      
      </>
    );
};

export default Inventario;