import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Navbar,
  Nav,
  Container,
  Row,
  Col,
  NavDropdown,
} from "react-bootstrap";
import { FaFacebook, FaInstagram,FaWhatsapp } from "react-icons/fa";

const ClientHome = () => {
  const navigate = useNavigate();

  // Función para cerrar sesión
  const handleLogout = async () => {
    await fetch(
      "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/logout.php"
    );
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  return (
    <div>
      {/* Navbar */}
      <Navbar
        bg="dark"
        expand="lg"
        className="fixed-top shadow-sm"

      >
        <Container style={{background: "#fff"}}>
          <Navbar.Brand href="/client-home" className="fw-bold" >
            Bekubes
            <img
                            width={50}
                            height={50}
                src="http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/uploads/Captura%20de%20pantalla%202025-02-17%20224603.png" 
                alt="logo"
                className="img-fluid"
              />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="/catalogo-productos" className="mx-2">
                Catalogo de Productos
              </Nav.Link>
              <Nav.Link href="/men" className="mx-2">
                Carrito
              </Nav.Link>
              <Nav.Link href="/about" className="mx-2">
              Sobre Nosotros
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
              >
                <NavDropdown.Item onClick={handleLogout} >
                  Cerrar sesión
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <div
        style={{
          paddingTop: "80px",
          background: "linear-gradient(to right,rgba(255, 255, 255, 0.83),rgb(255, 255, 255))",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h1 className="display-4 fw-bold">
                Los mejores cubos en nuesta tienda
              </h1>
              <p className="lead my-4">
              ¡Descubre el desafío que despierta tu mente y agiliza tus manos! Con el cubo de Rubik, no solo tienes un juguete, ¡tienes un pasaporte a horas de diversión, aprendizaje y superación personal! Perfecto para todas las edades, es el regalo ideal para mentes curiosas y amantes de los retos. ¡Hazte con el tuyo y comienza a girar hacia la victoria!"
              </p>
            </Col>
            <Col md={6} className="text-center">
              <img
                src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2o1eWl0d2VoMHRjYnJycjhyZjE5bXRzbzBoMWk4bzV2cmJvdWkyNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/qnlIw1jKhQhZnim1n0/giphy.gif" 
                alt="Cubo"
                className="img-fluid"
              />
            </Col>
          </Row>
        </Container>
      </div>

      {/* Sección de Beneficios */}
      <div style={{ padding: "100px 0", background: "#ffff" }}>
        <Container>
          <Row className="text-center">
            <Col md={4} className="mb-4">
              <h3 className="fw-bold">Precios Reasonables</h3>
              <p>
                Ofrecemos una gran variedad de precios para toda la familia
              </p>
              <img
                src="https://img.icons8.com/?size=100&id=63811&format=png&color=000000" 
                alt="Precio"
                className="img-fluid"
              />
            </Col>
            <Col md={4} className="mb-4">
              <h3 className="fw-bold">Alta Calidad</h3>
              <p>
                 Nuestros cubos son de la mejor calidad y nuestro provedores nos dan los mejores productos del mercado
              </p>
              <img
                src="https://img.icons8.com/?size=100&id=U8PNLNMhOOtq&format=png&color=000000" 
                alt="Calidad"
                className="img-fluid"
              />
            </Col>
            <Col md={4} className="mb-4">
              <h3 className="fw-bold">Excelente Servicio</h3>
              <p>
                Tenemos un gran servicio para nuestros clientes y llevamos el cubo a tu casa sin preocupaciones
              </p>
              <img
                src="https://img.icons8.com/?size=100&id=15196&format=png&color=000000" 
                alt="Servicio"
                className="img-fluid"
              />
            </Col>
          </Row>
        </Container>
      </div>

      {/* Footer */}
      <footer
        style={{ background: "#696969", color: "#fff", padding: "15px 0", height:"300px"}}
      >
        <Container style={{width:"1000px", height:"200px"}}>
          <Row>
            <div
              style={{
                background: "#696969",
                color: "#fff",
                padding: "20px 0",
                textAlign: "center",
              }}
            >
              <p className="mb-0">
                &copy; 2025 Bekubes. Todos los derechos reservados.
              </p>
            </div>
            <Col md={4}>
              <h5>Redes Sociales</h5>
              <ul className="list-unstyled">
                <li>
                  <a href="https://www.facebook.com/Bekubes" className="text-dark">
                    <FaFacebook /> Facebook
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/bekubes/" className="text-dark">
                    <FaInstagram /> Instagram
                  </a>
                </li>
                <li>
                  <a href="https://web.whatsapp.com/" className="text-dark">
                    <FaWhatsapp />Whatsapp
                  </a>
                </li>
              </ul>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default ClientHome;
