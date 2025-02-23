import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./stylesU.css";
import Swal from "sweetalert2";

const Usuarios = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]); // Lista completa de usuarios
  const [showDisabled, setShowDisabled] = useState(false); // Estado para mostrar solo deshabilitados
  const [loading, setLoading] = useState(true);
  const adminEmail = localStorage.getItem("email");

  // hacer el logout
  const handleLogout = async () => {
    await fetch(
      "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/logout.php"
    );
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  useEffect(() => {
    fetch(
      "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/getUsuarios.php"
    )
      .then((response) => response.json())
      .then((data) => {
        setUsuarios(data); // Guardar la lista completa de usuarios
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener usuarios", error);
        setLoading(false);
      });
  }, []);

  const handleEdit = (id) => {
    navigate(`/edit-user/${id}`);
  };

  const handleDelete = (id, estadoActual) => {
    const accion = estadoActual === 1 || estadoActual === true ? "habilitar" : "deshabilitar";
  
    Swal.fire({
      title: `¿Estás seguro?`,
      text: `¡No podrás revertir esto!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/deleteUsuario.php?id=${id}`, {
          method: "PUT",
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Error en la respuesta del servidor");
            }
            return response.json();
          })
          .then((data) => {
            if (data.success) {
              Swal.fire({
                icon: "success",
                title: `¡${accion.charAt(0).toUpperCase() + accion.slice(1)}!`,
                text: data.success,
              }).then(() => {
                // Recargar la lista de usuarios desde el backend
                fetch("http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/getUsuarios.php")
                  .then((response) => response.json())
                  .then((data) => setUsuarios(data)) // Actualizar la lista completa
                  .catch((error) => console.error("Error al obtener usuarios", error));
              });
            } else if (data.error) {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: data.error,
              });
            }
          })
          .catch((error) => {
            console.error("Error al cambiar el estado del usuario", error);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Hubo un problema al cambiar el estado del usuario. Por favor, inténtalo de nuevo.",
            });
          });
      }
    });
  };
  // Filtrar usuarios según el estado
  const filteredUsuarios = showDisabled
    ? usuarios.filter((user) => user.estado === 1 || user.estado === true) // Mostrar solo usuarios deshabilitados
    : usuarios.filter((user) => user.estado === 0 || user.estado === false); // Mostrar solo usuarios activos

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

      <div className="container2">
        <h2>Lista de Usuarios</h2>
        {loading ? (
          <div className="loading">Cargando...</div>
        ) : (
          <>
            <button
              className={`btn ${
                showDisabled ? "btn-secondary" : "btn-primary"
              } mb-3`}
              onClick={() => setShowDisabled(!showDisabled)}
            >
              {showDisabled
                ? "Ocultar usuarios deshabilitados"
                : "Ver usuarios deshabilitados"}
            </button>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Apellido 1</th>
                  <th>Apellido 2</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Fecha de Creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsuarios.map((user) => (
                  <tr key={user.ID_Usuario}>
                    <td>{user.ID_Usuario}</td>
                    <td>{user.nombre}</td>
                    <td>{user.apellido1}</td>
                    <td>{user.apellido2}</td>
                    <td>{user.email}</td>
                    <td>{user.Rol}</td>
                    <td>{user.FechaCreacion}</td>
                    <td>
                      <button
                        className="btn btn-warning me-2"
                        onClick={() => handleEdit(user.ID_Usuario)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() =>
                          handleDelete(user.ID_Usuario, user.estado)
                        } // Pasar el estado actual
                      >
                        {user.estado === 1 || user.estado === true
                          ? "Habilitar"
                          : "Deshabilitar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="btn btn-volver"
              onClick={() => navigate("/admin-home")}
            >
              Volver
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default Usuarios;
