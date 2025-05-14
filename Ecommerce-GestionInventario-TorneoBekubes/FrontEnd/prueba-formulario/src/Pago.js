import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const Pago = () => {
  const { idPedido } = useParams();
  const navigate = useNavigate();
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [totalUSD, setTotalUSD] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [error, setError] = useState(null);
  const email = localStorage.getItem('email');

  // Cargar el script de PayPal
  useEffect(() => {
    if (!window.paypal) {
      const script = document.createElement("script");
      script.src = "https://www.paypal.com/sdk/js?client-id=ASUWlwcB6_7jE2YjkoMo8a_a72m5IhyqYXgI5-KVkZB3QSge4RHsRoxWu06pPdRrT2I4uezprCKJuzpV&currency=USD";
      script.async = true;
      script.onload = () => {
        setPaypalLoaded(true);
        console.log("PayPal script cargado");
      };
      document.body.appendChild(script);
    } else {
      setPaypalLoaded(true);
      console.log("PayPal script ya cargado");
    }

    return () => {
      const script = document.querySelector(
        `script[src="https://www.paypal.com/sdk/js?client-id=ASUWlwcB6_7jE2YjkoMo8a_a72m5IhyqYXgI5-KVkZB3QSge4RHsRoxWu06pPdRrT2I4uezprCKJuzpV&currency=USD"]`
      );
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Obtener el total y detalles del pedido desde el backend
  useEffect(() => {
    if (idPedido) {
      setLoadingDetails(true);
      setError(null);
      
      fetch(`http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/getPedidos.php?idPedido=${idPedido}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error al obtener el total del pedido");
          }
          return response.json();
        })
        .then((data) => {
          if (data.total) {
            setTotalUSD(parseFloat(data.total) || 0);
            return fetch(`http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/getDetallesPedido.php?idPedido=${idPedido}`);
          } else {
            throw new Error(data.error || "Error al obtener el total del pedido");
          }
        })
        .then(response => {
          if (!response.ok) {
            throw new Error("Error al obtener detalles del pedido");
          }
          return response.json();
        })
        .then(detailsData => {
          if (detailsData.success) {
            const formattedDetails = detailsData.data.map(item => ({
              ...item,
              Precio: parseFloat(item.Precio) || 0,
              Cantidad: parseInt(item.Cantidad) || 0
            }));
            setOrderDetails(formattedDetails);
          } else {
            throw new Error(detailsData.message || "No se encontraron detalles del pedido");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          setError(error.message);
        })
        .finally(() => {
          setLoadingDetails(false);
        });
    }
  }, [idPedido]);

  // Renderizar el botón de PayPal cuando esté listo
  useEffect(() => {
    if (paypalLoaded && totalUSD !== null && !isNaN(totalUSD)) {
      window.paypal
        .Buttons({
          style: {
            color: "blue",
            shape: "pill",
            label: "pay",
            height: 40,
            layout: "vertical",  
            tagline: false,      
            margin: 0            
          },
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: totalUSD,
                  },
                },
              ],
            });
          },
          onApprove: (data, actions) => {
            return actions.order.capture().then((details) => {
              fetch("http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/procesoPago.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    transactionId: data.orderID,
                    payerName: details.payer.name.given_name + " " + details.payer.name.surname,
                    amount: totalUSD,
                    idPedido: idPedido,
                    payerEmail: email,
                }),
              })
              .then((response) => {
                  if (!response.ok) {
                      return response.text().then(text => { throw new Error(text) });
                  }
                  return response.json();
              })
              .then((data) => {
                  if (data.success) {
                      console.log("Pago registrado exitosamente", data);
                      setPaymentSuccess(true);
                  } else {
                      console.error("Error al registrar el pago:", data.error);
                  }
              })
              .catch((error) => {
                  console.error("Error al registrar el pago", error.message);
              });
            });
          },
        })
        .render("#paypal-button-container");
    
        setTimeout(() => {
          const buttons = document.querySelector('#paypal-button-container').querySelectorAll('[role="button"]');
          buttons.forEach(button => {
            button.style.margin = '0 auto';
            button.style.display = 'block';
          });
        }, 500);
      }
    }, [paypalLoaded, totalUSD, idPedido, email]);

  return (
    <div className="container mt-5">
      <h2>Pago con PayPal</h2>
      {paymentSuccess ? (
        <div className="alert alert-success">
          <h3>¡Gracias por su compra!</h3>
          <p>Su pago ha sido procesado exitosamente y su pedido está siendo enviado.</p>
          {/* Botón Volver agregado aquí */}
          <button 
            className="btn btn-primary mt-3"
            onClick={() => navigate('/client-home')}
          >
            Volver al inicio
          </button>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <h4>Error al cargar el pedido</h4>
          <p>{error}</p>
          {/* Botón Volver agregado aquí */}
          <button 
            className="btn btn-primary mt-3"
            onClick={() => navigate('/client-home')}
          >
            Volver al inicio
          </button>
        </div>
      ) : paypalLoaded && totalUSD !== null && !isNaN(totalUSD) ? (
        <div>
          <div className="card mb-4">
            <div className="card-header">
              <h4>Detalles de tu pedido</h4>
            </div>
            <div className="card-body">
              {loadingDetails ? (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p>Cargando detalles del pedido...</p>
                </div>
              ) : orderDetails.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio unitario</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderDetails.map((item, index) => (
                        <tr key={index}>
                          <td>{item.NombreProducto}</td>
                          <td>{item.Cantidad}</td>
                          <td>${item.Precio.toFixed(2)}</td>
                          <td>${(item.Cantidad * item.Precio).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" className="text-end fw-bold">Total:</td>
                        <td className="fw-bold">${totalUSD.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p>No se encontraron productos en este pedido.</p>
              )}
            </div>
          </div>
          
          <div className="d-flex justify-content-center">
            <div id="paypal-button-container" style={{ 
              minWidth: '200px', 
              maxWidth: '500px', 
              width: '100%' 
            }}></div>
          </div>
          
          {/* Botón Volver agregado aquí */}
          <div className="text-center mt-4">
            <button 
              className="btn btn-secondary"
              onClick={() => navigate(-1)} // Vuelve a la página anterior
            >
              Volver 
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p>Cargando información de pago...</p>
        </div>
      )}
    </div>
  );
};

export default Pago;