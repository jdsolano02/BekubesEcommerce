import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Pago = () => {
  const { idPedido } = useParams(); // Obtener el idPedido desde la URL
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [totalCRC, setTotalCRC] = useState(null); // Total en CRC
  const [totalUSD, setTotalUSD] = useState(null); // Total en USD
  const [exchangeRate, setExchangeRate] = useState(null); // Tasa de cambio (CRC a USD)
  const [paymentSuccess, setPaymentSuccess] = useState(false); // Estado para controlar si el pago fue exitoso
  const email = localStorage.getItem('email'); // Obtener el correo desde localStorage
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

  // Obtener el total del pedido en CRC desde el backend
  useEffect(() => {
    if (idPedido) {
      fetch(`http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/getPedidos.php?idPedido=${idPedido}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error en la respuesta del servidor");
          }
          return response.json(); // Convertir la respuesta a JSON
        })
        .then((data) => {
          console.log("Respuesta del servidor:", data); // Verifica los datos recibidos
          if (data.total) {
            setTotalCRC(data.total); // Actualiza el estado con el total en CRC
            console.log("Total obtenido en CRC:", data.total);
          } else {
            console.error("Error al obtener el total del pedido:", data.error);
          }
        })
        .catch((error) => {
          console.error("Error en la llamada fetch:", error);
        });
    }
  }, [idPedido]);

  // Obtener la tasa de cambio (CRC a USD)
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch(
          "https://v6.exchangerate-api.com/v6/b2c583a9745839f804ee32a2/latest/CRC" // Reemplaza TU_API_KEY con tu clave
        );
        const data = await response.json();

        if (data && data.conversion_rates && data.conversion_rates.USD) {
          setExchangeRate(data.conversion_rates.USD); // Establecer la tasa de cambio
          console.log("Tasa de cambio obtenida:", data.conversion_rates.USD);
        } else {
          console.error("Error al obtener la tasa de cambio:", data.error);
        }
      } catch (error) {
        console.error("Error en la llamada fetch:", error);
      }
    };

    fetchExchangeRate();
  }, []);

  // Convertir el total de CRC a USD cuando ambos estén disponibles
  useEffect(() => {
    if (totalCRC !== null && exchangeRate !== null) {
      const totalUSD = (totalCRC * exchangeRate).toFixed(2); // Convertir y redondear a 2 decimales
      setTotalUSD(totalUSD); // Actualizar el estado con el total en USD
      console.log("Total convertido a USD:", totalUSD);
    }
  }, [totalCRC, exchangeRate]);

  // Renderizar el botón de PayPal cuando esté listo
  useEffect(() => {
    console.log("paypalLoaded:", paypalLoaded, "totalUSD:", totalUSD); // Verifica los estados antes de cargar el botón
    if (paypalLoaded && totalUSD !== null && !isNaN(totalUSD)) {
      window.paypal
        .Buttons({
          style: {
            color: "blue", // Color del botón (gold, blue, silver, white, black)
            shape: "pill", // Forma del botón (pill o rect)
            label: "pay", // Texto del botón (paypal, checkout, buynow, pay, installment)
            height: 40, // Altura del botón en píxeles
            layout: "vertical", // Diseño del botón (vertical u horizontal)
          },
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: totalUSD, // Usa el total en USD
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
                    payerName: details.payer.name.given_name + " " + details.payer.name.surname, // Nombre completo
                    amount: totalUSD,
                    idPedido: idPedido,
                    payerEmail: email, // Usar el correo del localStorage
                }),
            })
            .then((response) => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text) }); // Captura la respuesta como texto
                }
                return response.json(); // Convertir la respuesta a JSON
            })
            .then((data) => {
                if (data.success) {
                    console.log("Pago registrado exitosamente", data);
                    setPaymentSuccess(true); // Actualizar el estado para mostrar el mensaje de agradecimiento
                } else {
                    console.error("Error al registrar el pago:", data.error);
                }
            })
            .catch((error) => {
                console.error("Error al registrar el pago", error.message); // Muestra el mensaje de error completo
            });
          });
          },
        })
        .render("#paypal-button-container");
    } else {
      console.log("Esperando que PayPal se cargue o el total en USD sea válido...", "totalUSD:", totalUSD);
    }
  }, [paypalLoaded, totalUSD, idPedido]);

  return (
    <div className="container mt-5">
      <h2>Pago con PayPal</h2>
      {paymentSuccess ? (
        <div className="alert alert-success">
          <h3>¡Gracias por su compra!</h3>
          <p>Su pago ha sido procesado exitosamente y su pedido está siendo enviado.</p>
        </div>
      ) : paypalLoaded && totalUSD !== null && !isNaN(totalUSD) ? (
        <div>
          {/* Disclaimer sobre el tipo de cambio */}
          <div className="alert alert-info mb-4">
            <p>
              <strong>Importante:</strong> El pago se realizará en dólares estadounidenses (USD).
              <br />
              El tipo de cambio utilizado es <strong>1 USD = {exchangeRate} CRC</strong>.
              <br />
              El monto convertido es <strong>{totalUSD} USD</strong>.
            </p>
          </div>
          <div id="paypal-button-container"></div>
        </div>
      ) : (
        <p>Cargando PayPal y total del pedido...</p>
      )}
    </div>
  );
};

export default Pago;