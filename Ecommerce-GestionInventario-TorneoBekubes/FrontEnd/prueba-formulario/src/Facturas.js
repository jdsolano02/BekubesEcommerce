import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaCube } from "react-icons/fa";
import './StyleCube.css'

const VerFacturas = () => {
  const [factura, setFactura] = useState(null);
  const { idPedido } = useParams(); // Obtener el ID_Pedido desde la URL
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener la factura correspondiente al ID_Pedido
    const obtenerFactura = async () => {
      try {
        const response = await fetch(
          `http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/obtenerFacturas.php?idPedido=${idPedido}`
        );
        const data = await response.json();

        if (data.success) {
          setFactura(data.factura);
        } else {
          console.error("Error al obtener la factura:", data.message);
        }
      } catch (error) {
        console.error("Error en la llamada fetch:", error);
      }
    };

    obtenerFactura();
  }, [idPedido]);

if (!factura) {
  return (
    <div className="fullscreen-loading">
      <div className="spinner-container">
        <FaCube className="cube-spinner" />
        <FaCube className="cube-spinner" />
      </div>
      <h2 className="loading-text">Cargando tu factura</h2>
      <p className="loading-subtext" style={{color:'black'}}>Estamos preparando todos los detalles...</p>
    </div>
  );
}
  return (
    <div className="container mt-5">
      <h2>Factura del Pedido #{idPedido}</h2>
      <p><strong>ID Factura:</strong> {factura.ID_Factura}</p>
      <p><strong>ID Pedido:</strong> {factura.ID_Pedido}</p>
      <p><strong>Fecha de Creación:</strong> {new Date(factura.Fecha_Creacion).toLocaleString()}</p>
      <a
        href={`http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/${factura.Ruta_PDF}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary"
        style={{backgroundColor:'#ff6347'}}
      >
        <i className="fas fa-file-pdf"></i> Ver PDF
      </a>
      <button
        onClick={() => navigate(-1)} // Volver atrás
        className="btn btn-secondary ml-2"
        style={{backgroundColor:'#1a1a1a'}}
      >
        <i className="fas fa-arrow-left"></i> Volver
      </button>
    </div>
  );
};

export default VerFacturas;