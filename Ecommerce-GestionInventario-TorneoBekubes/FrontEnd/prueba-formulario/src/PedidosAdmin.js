import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styleAdmin.css";

const PedidosAdmin = () => {
  const navigate = useNavigate();
  const adminEmail = localStorage.getItem("email");

  const [todosLosPedidos, setTodosLosPedidos] = useState([]); // Todos los pedidos
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]); // Pedidos filtrados
  const [filtroEstado, setFiltroEstado] = useState(""); // Estado seleccionado para filtrar

  // Función para cargar los pedidos desde el backend
  const cargarPedidos = async () => {
    try {
      const response = await fetch(
        "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/obtenerPedido.php"
      );
      const data = await response.json();

      if (data.status === "success") {
        setTodosLosPedidos(data.pedidos); // Guardar todos los pedidos
        aplicarFiltro(data.pedidos, filtroEstado); // Aplicar filtro inicial
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los pedidos.",
      });
    }
  };

  // Función para aplicar el filtro
  const aplicarFiltro = (pedidos, estado) => {
    if (estado) {
      // Filtrar los pedidos por estado
      const filtrados = pedidos.filter((pedido) => pedido.Estado === estado);
      setPedidosFiltrados(filtrados);
    } else {
      // Si no hay filtro, mostrar todos los pedidos
      setPedidosFiltrados(pedidos);
    }
  };

  // Función para actualizar el estado de un pedido
  const cambiarEstadoPedido = async (idPedido, nuevoEstado) => {
    try {
      const response = await fetch(
        "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/actualizarEstadoPedido.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idPedido, nuevoEstado }),
        }
      );
      const data = await response.json();

      if (data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Estado actualizado",
          text: "El estado del pedido se ha actualizado correctamente.",
        });
        cargarPedidos(); // Recargar la lista de pedidos
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el estado del pedido.",
      });
    }
  };

  // Cargar los pedidos al montar el componente
  useEffect(() => {
    cargarPedidos();
  }, []);

  // Aplicar el filtro cuando cambie el valor de filtroEstado
  useEffect(() => {
    aplicarFiltro(todosLosPedidos, filtroEstado);
  }, [filtroEstado, todosLosPedidos]);

  return (
    <>
      {/* Navbar */}
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
                  Pedidos
                </button>
              </li>
            </ul>
            <span className="navbar-text text-white me-3">
              Bienvenido, {adminEmail}
            </span>
            <button className="btn btn-danger" onClick={() => navigate("/login")}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido de la página de pedidos */}
      <div className="container mt-5">
        <h1>Pedidos</h1>
        <select
          className="form-select mb-3"
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="Procesando">Procesando</option>
          <option value="Enviado">Enviado</option>
          <option value="Entregado">Entregado</option>
        </select>

        <table className="table table-bordered">
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Email del Usuario</th> {/* Nueva columna para el email */}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidosFiltrados.map((pedido) => (
              <tr key={pedido.ID_Pedido}>
                <td>{pedido.ID_Pedido}</td>
                <td>{pedido.Estado}</td>
                <td>{pedido.Fecha}</td>
                <td>{pedido.Email}</td> {/* Mostrar el email del usuario */}
                <td>
                  <select
                    className="form-select"
                    onChange={(e) =>
                      cambiarEstadoPedido(pedido.ID_Pedido, e.target.value)
                    }
                  >
                    <option value="Procesando">Procesando</option>
                    <option value="Enviado">Enviado</option>
                    <option value="Entregado">Entregado</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default PedidosAdmin;