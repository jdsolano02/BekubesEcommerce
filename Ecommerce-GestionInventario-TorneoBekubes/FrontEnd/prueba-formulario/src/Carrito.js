import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styleC.css";

const Carrito = () => {
  const [carrito, setCarrito] = useState([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  // Obtener el carrito desde la base de datos
  const obtenerCarrito = async () => {
    const idUsuario = localStorage.getItem("user_id"); // Obtén el ID del usuario desde el localStorage
  
    if (!idUsuario) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se encontró el ID del usuario.",
      });
      return;
    }
  
    try {
      const response = await fetch(
        `http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/obtenerCarrito.php?idUsuario=${idUsuario}`
      );
      const data = await response.json();
  
      if (data.status === "success") {
        setCarrito(data.items); // Actualiza el estado del carrito con los items obtenidos
        calcularTotal(data.items); // Calcula el total
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    }
  };

  // Calcular el total del carrito
  const calcularTotal = (items) => {
    const totalCalculado = items.reduce(
      (acc, item) => acc + item.Precio * item.Cantidad,
      0
    );
    setTotal(totalCalculado);
  };

  // Ajustar la cantidad de un producto en el carrito
  const ajustarCantidad = async (idProducto, nuevaCantidad) => {
    if (nuevaCantidad < 1) {
      Swal.fire({
        icon: "warning",
        title: "Cantidad inválida",
        text: "La cantidad no puede ser menor que 1.",
      });
      return;
    }

    try {
      const response = await fetch(
        "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/ajustarCarrito.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idProducto, nuevaCantidad }),
        }
      );

      const data = await response.json();
      if (data.status === "success") {
        // Actualiza el estado del carrito en el frontend
        const carritoActualizado = carrito.map((item) =>
          item.ID_Producto === idProducto ? { ...item, cantidad: nuevaCantidad } : item
        );
        setCarrito(carritoActualizado);
        calcularTotal(carritoActualizado); // Recalcula el total
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    }
  };

  // Cargar el carrito al montar el componente
  useEffect(() => {
    obtenerCarrito();
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Carrito de Compras</h1>

      {/* Tabla de productos */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="thead-dark">
            <tr>
              <th>Producto</th>
              <th>Precio Unitario</th>
              <th>Cantidad</th>
              <th>Subtotal</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {carrito.map((item) => (
              <tr key={item.ID_Producto}>
                <td>{item.Nombre}</td>
                <td>${item.Precio.toFixed(2)}</td>
                <td>
                  <div className="d-flex justify-content-center">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => ajustarCantidad(item.ID_Producto, item.Cantidad - 1)}
                    >
                      -
                    </button>
                    <span className="mx-3">{item.Cantidad}</span>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => ajustarCantidad(item.ID_Producto, item.Cantidad + 1)}
                    >
                      +
                    </button>
                  </div>
                </td>
                <td>${(item.Precio * item.Cantidad).toFixed(2)}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => ajustarCantidad(item.ID_Producto, 0)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resumen del carrito */}
      <div className="text-end mt-4">
        <h4>Total: ${total.toFixed(2)}</h4>
        <button className="btn btn-success" onClick={() => navigate("/checkout")}>
          Finalizar Compra
        </button>
      </div>
    </div>
  );
};

export default Carrito;
