import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Container, Row, Col, NavDropdown } from "react-bootstrap";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const navigate = useNavigate();
  const idUsuario = localStorage.getItem("user_id");
  const [cantidadCarrito, setCantidadCarrito] = useState(0);

  // Función para cargar los pedidos del cliente
  const cargarPedidos = async () => {
    try {
      const response = await fetch(
        `http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/obtenerPedidosUsuarios.php?idUsuario=${idUsuario}`
      );
      const data = await response.json();

      if (data.status === "success") {
        setPedidos(data.pedidos);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los pedidos.",
      });
    }
  };

  const handleLogout = async () => {
    await fetch(
      "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/logout.php"
    );
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  // Cargar los pedidos al montar el componente
  useEffect(() => {
    if (idUsuario) {
      cargarPedidos();
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Debes iniciar sesión para ver tus pedidos.",
      }).then(() => {
        navigate("/login"); // Redirigir al usuario a la página de login
      });
    }
  }, [idUsuario, navigate]);

  // Cargar la cantidad de productos en el carrito
  useEffect(() => {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const cantidadTotal = carrito.reduce(
      (total, item) => total + item.Cantidad,
      0
    );
    setCantidadCarrito(cantidadTotal);
  }, []);

  return (
    <>
      {/* Navbar */}
      <Navbar bg="dark" expand="lg" className="fixed-top shadow-sm">
        <Container style={{ background: "#fff" }}>
          <Navbar.Brand href="/client-home" className="fw-bold">
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
              <Nav.Link href="/carrito" className="mx-2">
                Carrito (
                <span style={{ color: "red", fontWeight: "bold" }}>{cantidadCarrito}</span>)
              </Nav.Link>
              <Nav.Link href="/pedido" className="mx-2">
                Mis Pedidos
              </Nav.Link>
              <Nav.Link href="/sobre-nosotros" className="mx-2">
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
                <NavDropdown.Item onClick={handleLogout}>
                  Cerrar sesión
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Contenido de la página de pedidos */}
      <div className="container mt-5" style={{ paddingTop: "200px", minHeight: "100vh" }}>
        <h1>Mis Pedidos</h1>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido.ID_Pedido}>
                <td>{pedido.ID_Pedido}</td>
                <td>{pedido.Estado}</td>
                <td>{pedido.Fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <footer
        style={{
          background: "#696969",
          color: "#fff",
          padding: "15px 0",
          minHeight: "300px",
        }}
      >
        <Container style={{ width: "1000px", height: "200px" }}>
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
                  <a
                    href="https://www.facebook.com/Bekubes"
                    className="text-dark"
                  >
                    <FaFacebook /> Facebook
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com/bekubes/"
                    className="text-dark"
                  >
                    <FaInstagram /> Instagram
                  </a>
                </li>
                <li>
                  <a href="https://web.whatsapp.com/" className="text-dark">
                    <FaWhatsapp />
                    Whatsapp
                  </a>
                </li>
              </ul>
            </Col>
          </Row>
        </Container>
      </footer>
    </>
  );
};

export default Pedidos;