import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, role }) => {
  const userRole = localStorage.getItem("role");
  const userEmail = localStorage.getItem("email");

  // Si no hay usuario logueado, redirigir al login
  if (!userEmail) {
    return <Navigate to="/login" />;
  }

  // Si el rol del usuario no coincide con el rol requerido, redirigir a la página de no autorizado
  if (userRole !== role) {
    return <Navigate to="/unauthorized" />;
  }

  // Si el rol coincide, renderiza el contenido protegido
  return children;
};

export default PrivateRoute;