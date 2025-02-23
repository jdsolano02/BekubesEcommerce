import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./SobreNosotros.css"; // Archivo CSS para estilos personalizados

const SobreNosotros = () => {
  const [estaAbierto, setEstaAbierto] = useState("Cargando...");

  // Función para verificar si la tienda está abierta
  const verificarHorario = () => {
    const ahora = new Date();
    const horaActual = ahora.getHours();
    const minutosActuales = ahora.getMinutes();

    // Horario de atención: 9:00 AM - 6:00 PM
    const horaApertura = 9;
    const horaCierre = 18; // 6:00 PM en formato de 24 horas

    if (horaActual > horaApertura && horaActual < horaCierre) {
      setEstaAbierto("Sí");
    } else if (horaActual === horaApertura && minutosActuales >= 0) {
      setEstaAbierto("Sí");
    } else if (horaActual === horaCierre && minutosActuales === 0) {
      setEstaAbierto("Sí");
    } else {
      setEstaAbierto("No");
    }
  };

  // Verificar el horario al cargar el componente y cada minuto
  useEffect(() => {
    verificarHorario(); // Verificar al cargar
    const intervalo = setInterval(verificarHorario, 60000); // Actualizar cada minuto
    return () => clearInterval(intervalo); // Limpiar intervalo al desmontar
  }, []);

  return (
    <div className="sobre-nosotros">
      {/* Hero2 Section */}
      <div className="hero2-section text-center py-5">
        <h1 className="display-4">Sobre Nosotros</h1>
        <p className="lead">
          Conoce más sobre Bekubes y nuestra pasión por los cubos Rubik.
        </p>
      </div>

      {/* Contenido Principal */}
      <Container className="my-5">
        <Row className="mb-5">
          <Col md={6}>
            <h2>¿Quiénes Somos?</h2>
            <p>
              Somos <strong>Bekubes</strong>, una tienda especializada en la
              venta y promoción de cubos tipo "Rubik" de las mejores marcas.
              Nuestra misión es satisfacer a aquellos cuya pasión es resolver
              estos fascinantes rompecabezas.
            </p>
            <p>
              En Bekubes, nos enorgullece ofrecer productos de alta calidad,
              desde cubos clásicos hasta modelos avanzados para profesionales.
              Además, brindamos asesoramiento personalizado para ayudarte a
              elegir el cubo perfecto según tus necesidades.
            </p>
          </Col>
          <Col md={6}>
            <img
              src="http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/uploads/Captura%20de%20pantalla%202025-02-17%20224603.png" // Reemplaza con una imagen real
              alt="Cubos Rubik"
              className="img-fluid rounded"
            />
          </Col>
        </Row>

        {/* Detalles de Contacto */}
        <Row className="mb-5">
          <Col md={6}>
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Información de Contacto</Card.Title>
                <Card.Text>
                  <strong>Dirección:</strong> San Juan, La Unión, Costa Rica
                  <br />
                  <strong>Teléfono:</strong> 8728 6926
                  <br />
                  <strong>Email:</strong> tiendabekubes@gmail.com
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Horario de Atención</Card.Title>
                <Card.Text>
                  <strong>Abierto ahora:</strong> {estaAbierto}
                  <br />
                  <strong>Horario:</strong> Lunes a Viernes: 9:00 AM - 6:00 PM
                  <br />
                  <strong>Recomendado por el 90%</strong> (6 opiniones)
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Testimonios */}
        <Row className="mb-5">
          <Col>
            <h2>Lo que dicen nuestros clientes</h2>
            <div className="testimonios">
              <blockquote className="blockquote">
                <p className="mb-0">
                  "Excelente servicio y productos de alta calidad. ¡Recomendado
                  100%!"
                </p>
                <footer className="blockquote-footer">Juan Pérez</footer>
              </blockquote>
              <blockquote className="blockquote">
                <p className="mb-0">
                  "Me encanta la variedad de cubos que ofrecen. Siempre
                  encuentro algo nuevo."
                </p>
                <footer className="blockquote-footer">María Gómez</footer>
              </blockquote>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Llamado a la Acción */}
      <div className="cta-section text-center py-5">
        <h2>¿Listo para resolver el siguiente desafío?</h2>
        <p>
          Explora nuestra colección de cubos Rubik y encuentra el perfecto para
          ti.
        </p>
        <a href="/catalogo-productos" className="btn btn-primary btn-lg">
          Ver Catálogo
        </a>
      </div>
    </div>
  );
};

export default SobreNosotros;
