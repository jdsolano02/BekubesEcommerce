import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styleC.css";

const Carrito = () => {
  const [carrito, setCarrito] = useState([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  // Cargar el carrito desde localStorage
  const obtenerCarrito = () => {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    setCarrito(carrito);
    calcularTotal(carrito);
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
  const ajustarCantidad = (idProducto, nuevaCantidad) => {
    if (nuevaCantidad < 1) {
      Swal.fire({
        icon: "warning",
        title: "Cantidad inválida",
        text: "La cantidad no puede ser menor que 1.",
      });
      return;
    }

    // Actualizar carrito en localStorage
    const carritoActualizado = carrito.map((item) =>
      item.ID_Producto === idProducto ? { ...item, Cantidad: nuevaCantidad } : item
    );
    setCarrito(carritoActualizado);
    localStorage.setItem("carrito", JSON.stringify(carritoActualizado));
    calcularTotal(carritoActualizado); // Recalcular el total
  };

  // Eliminar un producto del carrito
  const eliminarProducto = (idProducto) => {
    const carritoActualizado = carrito.filter((item) => item.ID_Producto !== idProducto);
    setCarrito(carritoActualizado);
    localStorage.setItem("carrito", JSON.stringify(carritoActualizado));
    calcularTotal(carritoActualizado); // Recalcular el total
  };
  // Generar Pedidos
  const finalizarCompra = async () => {
    const idUsuario = localStorage.getItem("user_id"); // Obtén el ID del usuario
  
    if (!idUsuario) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Debes iniciar sesión para finalizar la compra.",
      });
      return;
    }
  
    if (carrito.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Carrito vacío",
        text: "No hay productos en el carrito.",
      });
      return;
    }
  
    try {
      // Enviar los datos del carrito al backend
      const response = await fetch(
        "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/agregarPedido.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idUsuario: idUsuario,
            items: carrito, 
          }),
        }
      );
  
      const data = await response.json();
  
      if (data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Pedido creado",
          text: "Tu pedido se ha creado correctamente.",
        });
  
        // Limpiar el carrito después de finalizar la compra
        setCarrito([]);
        localStorage.removeItem("carrito");
        setTotal(0);
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
                    onClick={() => eliminarProducto(item.ID_Producto)}
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
        <button className="btn btn-success" onClick={finalizarCompra}>
          Finalizar Compra
        </button>
      </div>
    </div>
  );
};

export default Carrito;
