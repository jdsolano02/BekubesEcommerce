import React from "react";
import { useNavigate } from "react-router-dom";

const ClientHome = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch("http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/logout.php");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  return (
    <div>
      <h1>Bienvenido a la página de Cliente</h1>
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
};

export default ClientHome;