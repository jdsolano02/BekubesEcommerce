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
  const [enviandoResumenes, setEnviandoResumenes] = useState(false);

  // Función para enviar resúmenes a todos los clientes verificados
  const enviarResumenesPedidos = async () => {
    setEnviandoResumenes(true);

    try {
      const response = await fetch(
        "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/enviarResumenPedidos.php",
        {
          method: "POST",
          credentials: "include", // Incluye cookies o credenciales
          headers: {
            "Content-Type": "application/json", // Importante si se envían datos JSON
          },
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Resúmenes enviados",
          html: `
              <p>Total clientes: ${data.data.total_clientes}</p>
              <p>Enviados exitosamente: ${data.data.enviados}</p>
              <p>Errores: ${data.data.errores}</p>
            `,
        });
      } else {
        throw new Error(data.message || "Error al enviar resúmenes");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    } finally {
      setEnviandoResumenes(false);
    }
  };
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
                  Pedido Usuarios
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link btn btn-link"
                  onClick={() => navigate("/admin-torneo")}
                >
                  Torneos
                </button>
              </li>
            </ul>
            <span className="navbar-text text-white me-3">
              Bienvenido, {adminEmail}
            </span>
            <button
              className="btn btn-danger"
              onClick={() => navigate("/login")}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido de la página de pedidos */}
      <div className="container mt-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <h1 className="mb-3 mb-md-0">Pedidos de Usuarios</h1>
          <div className="d-flex flex-column flex-md-row gap-2">
            <button
              className="btn btn-warning"
              onClick={enviarResumenesPedidos}
              disabled={enviandoResumenes}
              style={{ backgroundColor: "#ff6347", color: "white" }}
            >
              {enviandoResumenes ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Enviando...
                </>
              ) : (
                "Enviar Resúmenes"
              )}
            </button>
            <select
              className="form-select"
              onChange={(e) => setFiltroEstado(e.target.value)}
              value={filtroEstado}
            >
              <option value="">Todos los estados</option>
              <option value="Procesando">Procesando</option>
              <option value="Enviado">Enviado</option>
              <option value="Entregado">Entregado</option>
            </select>
          </div>
        </div>

        {/* Versión para móviles */}
        <div className="d-md-none">
          {pedidosFiltrados.length > 0 ? (
            pedidosFiltrados.map((pedido) => (
              <div key={pedido.ID_Pedido} className="card mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <h5 className="card-title">Pedido #{pedido.ID_Pedido}</h5>
                    <span
                      className={`badge ${
                        pedido.Estado === "Procesando"
                          ? "bg-warning text-dark"
                          : pedido.Estado === "Enviado"
                          ? "bg-info text-dark"
                          : "bg-success"
                      }`}
                    >
                      {pedido.Estado}
                    </span>
                  </div>
                  <p className="card-text mb-1">
                    <strong>Fecha:</strong>{" "}
                    {new Date(pedido.Fecha).toLocaleDateString()}
                  </p>
                  <p className="card-text mb-2">
                    <strong>Cliente:</strong> {pedido.Email}
                  </p>
                  <p className="card-text mb-2">
                    <strong>Productos:</strong> {pedido.Productos}
                  </p>
                  <select
                    className="form-select form-select-sm mb-2"
                    onChange={(e) =>
                      cambiarEstadoPedido(pedido.ID_Pedido, e.target.value)
                    }
                    value={pedido.Estado}
                  >
                    <option value="Procesando">Procesando</option>
                    <option value="Enviado">Enviado</option>
                    <option value="Entregado">Entregado</option>
                  </select>
                </div>
              </div>
            ))
          ) : (
            <div className="alert alert-info">
              No hay pedidos con el filtro seleccionado
            </div>
          )}
        </div>

        {/* Versión para desktop */}
        <div className="d-none d-md-block">
          <div className="table-responsive">
            <table className="table table-hover table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>ID Pedido</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Email del Usuario</th>
                  <th>Productos</th>
                  <th>Cambiar Estado</th>
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.length > 0 ? (
                  pedidosFiltrados.map((pedido) => (
                    <tr key={pedido.ID_Pedido}>
                      <td>{pedido.ID_Pedido}</td>
                      <td>
                        <span
                          className={`badge ${
                            pedido.Estado === "Procesando"
                              ? "bg-warning text-dark"
                              : pedido.Estado === "Enviado"
                              ? "bg-info text-dark"
                              : "bg-success"
                          }`}
                        >
                          {pedido.Estado}
                        </span>
                      </td>
                      <td>{new Date(pedido.Fecha).toLocaleDateString()}</td>
                      <td>{pedido.Email}</td>
                      <td>{pedido.Productos}</td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          onChange={(e) =>
                            cambiarEstadoPedido(
                              pedido.ID_Pedido,
                              e.target.value
                            )
                          }
                          value={pedido.Estado}
                        >
                          <option value="Procesando">Procesando</option>
                          <option value="Enviado">Enviado</option>
                          <option value="Entregado">Entregado</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No hay pedidos con el filtro seleccionado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default PedidosAdmin;
