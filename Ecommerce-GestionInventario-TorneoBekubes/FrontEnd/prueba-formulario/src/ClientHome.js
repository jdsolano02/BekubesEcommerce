import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Container, Row, Col, NavDropdown } from "react-bootstrap";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { red } from "@mui/material/colors";

const ClientHome = () => {
  const navigate = useNavigate();
  const [cantidadCarrito, setCantidadCarrito] = useState(0);
  
  const handleLogout = async () => {
    await fetch(
      "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/logout.php"
    );
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  useEffect(() => {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const cantidadTotal = carrito.reduce(
      (total, item) => total + item.Cantidad,
      0
    );
    setCantidadCarrito(cantidadTotal);
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Navbar */}
      <Navbar bg="dark" expand="lg" className="fixed-top shadow-sm" style={{ minHeight: "100px" }}>
        <Container fluid="md" style={{ background: "#fff", borderRadius: "10px"}}>
          <Navbar.Brand
            href="/client-home"
            className="fw-bold d-flex align-items-center"
          >
            Bekubes
            <img
              width={50}
              height={50}
              src="http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/uploads/Captura%20de%20pantalla%202025-02-17%20224603.png"
              alt="logo"
              className="img-fluid ms-2"
            />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto flex-column flex-lg-row">
              <Nav.Link
                href="/catalogo-productos"
                className="mx-lg-2 my-1 my-lg-0"
              >
                Catalogo de Productos
              </Nav.Link>
              <Nav.Link href="/carrito" className="mx-lg-2 my-1 my-lg-0">
                Carrito (
                <span style={{ color: "red", fontWeight: "bold" }}>
                  {cantidadCarrito}
                </span>
                )
              </Nav.Link>
              <Nav.Link href="/pedido" className="mx-lg-2 my-1 my-lg-0">
                Mis Pedidos
              </Nav.Link>
              <Nav.Link href="/sobre-nosotros" className="mx-lg-2 my-1 my-lg-0">
                Sobre Nosotros
              </Nav.Link>
              <Nav.Link href="/client-torneo" className="mx-lg-2 my-1 my-lg-0">
                Torneos
              </Nav.Link>
            </Nav>
            <Nav>
              <NavDropdown
                title={
                  <span className="text-dark">
                    Bienvenido, {localStorage.getItem("email")}
                  </span>
                }
                id="basic-nav-dropdown"
                align="end"
              >
                <NavDropdown.Item
                  onClick={handleLogout} style={{color :"red"}}
                >
                  Cerrar sesión
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section - Diseño Mejorado */}
      <div
        style={{
          paddingTop: "100px",
          paddingBottom: "80px",
          background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)",
          minHeight: "calc(100vh - 80px)",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0 position-relative z-index-1">
              <h1
                className="display-3 fw-bold mb-4"
                style={{ color: "#2c3e50", lineHeight: "1.2" }}
              >
                Los mejores cubos{" "}
                <span style={{ color: "#e74c3c" }}>en nuestra tienda</span>
              </h1>
              <p
                className="lead mb-4"
                style={{ fontSize: "1.25rem", color: "#34495e" }}
              >
                ¡Descubre el desafío que despierta tu mente y agiliza tus manos!
                Con el cubo de Rubik, no solo tienes un juguete, ¡tienes un
                pasaporte a horas de diversión, aprendizaje y superación
                personal!
              </p>
            </Col>
            <Col lg={6} className="text-center">
              <div style={{ position: "relative" }}>
                <img
                  src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2o1eWl0d2VoMHRjYnJycjhyZjE5bXRzbzBoMWk4bzV2cmJvdWkyNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/qnlIw1jKhQhZnim1n0/giphy.gif"
                  alt="Cubo de Rubik animado"
                  className="img-fluid rounded-4 shadow-lg"
                  style={{
                    maxHeight: "400px",
                    border: "8px solid white",
                    transform: "rotate(5deg)",
                  }}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Sección de Ventajas - Diseño Mejorado */}
      <div
        style={{
          padding: "80px 0",
          background: "#ffffff",
          position: "relative",
        }}
      >
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3" style={{ color: "#2c3e50" }}>
              Nuestras <span style={{ color: "#e74c3c" }}>Ventajas</span>
            </h2>
            <p
              className="lead"
              style={{ maxWidth: "700px", margin: "0 auto", color: "#7f8c8d" }}
            >
              Todo lo que necesitas para disfrutar del mundo de los cubos
              mágicos
            </p>
          </div>

          <Row className="g-4">
            <Col md={4}>
              <div
                className="h-100 p-4 rounded-4 shadow-sm border-0 text-center"
                style={{
                  background:
                    "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                  transition: "transform 0.3s ease",
                  borderBottom: "4px solid #e74c3c",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-5px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <div
                  className="mb-4"
                  style={{ fontSize: "3rem", color: "#e74c3c" }}
                >
                  <i className="bi bi-tag-fill"></i>
                </div>
                <h3 className="fw-bold mb-3">Precios Razonables</h3>
                <p style={{ color: "#34495e" }}>
                  Ofrecemos una gran variedad de precios para toda la familia,
                  con opciones para todos los presupuestos sin comprometer la
                  calidad.
                </p>
              </div>
            </Col>

            <Col md={4}>
              <div
                className="h-100 p-4 rounded-4 shadow-sm border-0 text-center"
                style={{
                  background:
                    "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                  transition: "transform 0.3s ease",
                  borderBottom: "4px solid #3498db",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-5px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <div
                  className="mb-4"
                  style={{ fontSize: "3rem", color: "#3498db" }}
                >
                  <i className="bi bi-award-fill"></i>
                </div>
                <h3 className="fw-bold mb-3">Alta Calidad</h3>
                <p style={{ color: "#34495e" }}>
                  Nuestros cubos son de la mejor calidad, seleccionados
                  cuidadosamente entre los mejores proveedores del mercado.
                </p>
              </div>
            </Col>

            <Col md={4}>
              <div
                className="h-100 p-4 rounded-4 shadow-sm border-0 text-center"
                style={{
                  background:
                    "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                  transition: "transform 0.3s ease",
                  borderBottom: "4px solid #2ecc71",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-5px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <div
                  className="mb-4"
                  style={{ fontSize: "3rem", color: "#2ecc71" }}
                >
                  <i className="bi bi-headset"></i>
                </div>
                <h3 className="fw-bold mb-3">Excelente Servicio</h3>
                <p style={{ color: "#34495e" }}>
                  Ofrecemos entrega rápida, soporte postventa y garantías
                  extendidas para tu completa tranquilidad.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Footer */}
      <footer
        className="bg-dark text-white py-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
      >
        <Container>
          <Row className="align-items-center">
            <Col className="text-center">
              <div className="d-flex justify-content-center gap-4 mb-2">
                <a
                  href="https://www.facebook.com/Bekubes"
                  className="text-black"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <FaFacebook size={20} />
                </a>
                <a
                  href="https://www.instagram.com/bekubes/"
                  className="text-black"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <FaInstagram size={20} />
                </a>
                <a
                  href="https://web.whatsapp.com/"
                  className="text-black"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp size={20} />
                </a>
              </div>
              <p className="small mb-0" style={{ color: "rgba(0, 0, 0, 0.7)" }}>
                &copy; {new Date().getFullYear()} Bekubes. Todos los derechos
                reservados.
              </p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default ClientHome;
