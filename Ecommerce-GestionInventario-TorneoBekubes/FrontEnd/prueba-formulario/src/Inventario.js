import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styleAdmin.css";


const Inventario = () => {
  const navigate = useNavigate();
  const adminEmail = localStorage.getItem("email");

  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para cargar el inventario
  const cargarInventario = async () => {
    try {
      const response = await fetch(
        "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/getInventario.php"
      );
      const data = await response.json();

      if (data.status === "success") {
        setInventario(data.data);
        verificarStockBajo(data.data); // Verificar si hay stock bajo
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los datos del inventario.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar si hay stock bajo
  const verificarStockBajo = (inventario) => {
    const productosConStockBajo = inventario.filter(
      (item) => item.Stock < item.Stock_Minimo
    );

    if (productosConStockBajo.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Stock Bajo",
        text: `Los siguientes productos tienen stock bajo: ${productosConStockBajo
          .map((p) => p.Producto)
          .join(", ")}`,
      });
    }
  };

  // Función para actualizar el stock manualmente
  const actualizarStock = async (idInventario, nuevoStock) => {
    if (nuevoStock < 0) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "El stock no puede ser inferior a 0 unidades.",
      });
      return;
    }

    try {
      const response = await fetch(
        "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/actualizarStock.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idInventario, nuevoStock }),
        }
      );
      const data = await response.json();

      if (data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Stock Actualizado",
          text: "El stock se ha actualizado correctamente.",
        });
        cargarInventario(); // Recargar el inventario
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el stock.",
      });
    }
  };

  // Cargar el inventario al montar el componente
  useEffect(() => {
    cargarInventario();
  }, []);

  // Función para cerrar sesión
  const handleLogout = async () => {
    await fetch("http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/logout.php");
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <>
      <div>
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
                <button className="nav-link btn btn-link" onClick={() => navigate("/admin-torneo")}>Torneos</button>
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

    {/* Contenido de la página de inventario */}
<div className="container mt-5">
  <h1 className="mb-4">Inventario</h1>
  
  {/* Contenedor responsive para la tabla */}
  <div className="table-responsive">
    <table className="table table-bordered table-hover">
      <thead className="table-dark">
        <tr>
          <th>ID</th>
          <th>Producto</th>
          <th>Stock</th>
          <th>Mínimo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {inventario.map((item) => (
          <tr key={item.ID_Inventario} className={item.Stock < item.Stock_Minimo ? "table-warning" : ""}>
            <td data-label="ID ">{item.ID_Producto}</td>
            <td data-label="Producto ">{item.Producto}</td>
            <td data-label="Stock ">
              <input
                type="number"
                className="form-control form-control-sm"
                value={item.Stock}
                min="0"
                onChange={(e) => {
                  const nuevoInventario = inventario.map((i) =>
                    i.ID_Inventario === item.ID_Inventario
                      ? { ...i, Stock: e.target.value }
                      : i
                  );
                  setInventario(nuevoInventario);
                }}
              />
            </td>
            <td data-label="Mínimo " style={{padding: '10px 8px'}}>{item.Stock_Minimo}</td>
            <td data-label="Acciones " style={{padding: '10px 8px'}}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => actualizarStock(item.ID_Inventario, item.Stock)}
                style={{backgroundColor: '#ff6347'}}
              >
                Actualizar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
    </>
  );
};

export default Inventario;