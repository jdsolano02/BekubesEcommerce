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

    const carritoActualizado = carrito.map((item) =>
      item.ID_Producto === idProducto ? { ...item, Cantidad: nuevaCantidad } : item
    );
    actualizarCarrito(carritoActualizado);
  };

  // Eliminar un producto del carrito
  const eliminarProducto = (idProducto) => {
    const carritoActualizado = carrito.filter((item) => item.ID_Producto !== idProducto);
    actualizarCarrito(carritoActualizado);
  };

  // Función para actualizar el carrito en estado y localStorage
  const actualizarCarrito = (nuevoCarrito) => {
    setCarrito(nuevoCarrito);
    localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
    calcularTotal(nuevoCarrito);
  };

  // Limpiar el carrito completamente
  const limpiarCarrito = () => {
    setCarrito([]);
    localStorage.removeItem("carrito");
    setTotal(0);
  };

  // Generar Pedidos
  let procesandoPedido = false;

  const finalizarCompra = async () => {
    if (procesandoPedido) return;
    procesandoPedido = true;

    const boton = document.getElementById("btnFinalizarCompra");
    if (boton) boton.disabled = true;

    const carritoActual = JSON.parse(localStorage.getItem("carrito")) || [];
    const idUsuario = localStorage.getItem("user_id");
    const email = localStorage.getItem("email");

    if (carritoActual.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Carrito vacío",
        text: "No hay productos en el carrito.",
      });
      procesandoPedido = false;
      if (boton) boton.disabled = false;
      return;
    }

    try {
      const response = await fetch("http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/agregarPedido.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idUsuario: idUsuario,
          email: email,
          items: carritoActual,
        }),
      });

      const data = await response.json();
      console.log("Respuesta del backend:", data);

      if (data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Pedido creado",
          text: "Tu pedido se ha creado correctamente.",
        }).then(() => {
          // Limpiar el carrito después de confirmación
          limpiarCarrito();
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    } finally {
      procesandoPedido = false;
      if (boton) boton.disabled = false;
    }
  };

  // Cargar el carrito al montar el componente
  useEffect(() => {
    obtenerCarrito();
  }, []);

   return (
    <div className="container mt-4 carrito-container">
      <div className="card shadow-lg border-0">
        <div className="card-header bg-primary text-white">
          <h2 className="text-center mb-0 py-3" style={{color: 'white', fontSize: '3rem'}}>Tu Carrito de Compras</h2>
        </div>

        <div className="card-body">
          {carrito.length === 0 ? (
            <div className="text-center py-5 empty-cart">
              <h4 className="mt-3">Tu carrito está vacío</h4>
              <p className="text-muted">Agrega productos para continuar</p>
              <button
                className="btn btn-primary mt-3"
                onClick={() => navigate("/catalogo-productos")}
                style={{backgroundColor:'#ff7f50'}}
              >
                Ir al Catálogo
              </button>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Producto</th>
                      <th className="text-center">Precio</th>
                      <th className="text-center">Cantidad</th>
                      <th className="text-center">Subtotal</th>
                      <th className="text-end pe-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carrito.map((item) => (
                      <tr key={item.ID_Producto} className="product-row">
                        <td className="ps-4">
                          <div className="d-flex align-items-center">
                            <div className="product-thumbnail me-3">
                              {item.Imagen ? (
                                <img 
                                  src={`data:image/jpeg;base64,${item.Imagen}`} 
                                  alt={item.Nombre} 
                                  className="img-thumbnail"
                                  style={{width: '60px', height: '60px', objectFit: 'cover'}}
                                />
                              ) : (
                                <div className="thumbnail-placeholder bg-light d-flex align-items-center justify-content-center" style={{width: '60px', height: '60px'}}>
                                  <span>IMG</span>
                                </div>
                              )}
                            </div>
                            <span className="fw-medium">{item.Nombre}</span>
                          </div>
                        </td>
                        <td className="text-center">${item.Precio.toFixed(2)}</td>
                        <td className="text-center">
                          <div className="quantity-selector d-inline-flex align-items-center border rounded">
                            <button
                              className="btn btn-sm px-3 py-1"
                              onClick={() => ajustarCantidad(item.ID_Producto, item.Cantidad - 1)}
                            >
                              -
                            </button>
                            <span className="px-3">{item.Cantidad}</span>
                            <button
                              className="btn btn-sm px-3 py-1"
                              onClick={() => ajustarCantidad(item.ID_Producto, item.Cantidad + 1)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="text-center fw-bold">${(item.Precio * item.Cantidad).toFixed(2)}</td>
                        <td className="text-end pe-4">
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => eliminarProducto(item.ID_Producto)}
                            title="Eliminar"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="row mt-4">
                <div className="col-md-5 ms-auto">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title border-bottom pb-3">Resumen de Compra</h5>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Subtotal:</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between fw-bold fs-5 border-top pt-3">
                        <span>Total:</span>
                        <span className="text-primary">${total.toFixed(2)}</span>
                      </div>
                      
                      <div className="d-grid gap-2 mt-4">
                        <button 
                          className="btn btn-primary btn-lg"
                          onClick={finalizarCompra}
                          id="btnFinalizarCompra"
                          disabled={carrito.length === 0}
                          style={{backgroundColor: '#ff6347'}}
                        >
                          Finalizar Compra
                        </button>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => navigate("/catalogo-productos")}
                        >
                          Seguir Comprando
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Carrito;