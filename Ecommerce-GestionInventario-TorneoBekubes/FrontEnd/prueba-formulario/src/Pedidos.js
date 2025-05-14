import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Container, Row, Col, NavDropdown, Button, Form } from "react-bootstrap";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("todos");
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
        setPedidosFiltrados(data.pedidos); // Inicialmente mostrar todos
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

  // Función para manejar el pago de un pedido
  const handlePagar = (idPedido) => {
    navigate(`/pagar/${idPedido}`);
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

  // Función para filtrar los pedidos por estado
  const filtrarPedidos = (estado) => {
    setFiltroEstado(estado);
    if (estado === "todos") {
      setPedidosFiltrados(pedidos);
    } else {
      const filtrados = pedidos.filter(pedido => pedido.Estado === estado);
      setPedidosFiltrados(filtrados);
    }
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
        navigate("/login"); 
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

      {/* Contenido de la página de pedidos */}
      <div className="container mt-5" style={{ paddingTop: "100px", minHeight: "100vh" }}>
  <h1 className="mb-4">Mis Pedidos</h1>
  
  {/* Filtros por estado - Versión mejorada */}
  <div className="mb-4">
    <Form.Label className="fw-bold mb-2">Filtrar por estado:</Form.Label>
    <div className="d-flex flex-wrap gap-2 mb-4">
      <Button 
        variant={filtroEstado === "todos" ? "primary" : "outline-primary"}
        onClick={() => filtrarPedidos("todos")}
        size="sm"
      >
        Todos
      </Button>
      <Button 
        variant={filtroEstado === "Procesando" ? "primary" : "outline-primary"}
        onClick={() => filtrarPedidos("Procesando")}
        size="sm"
      >
        Procesando
      </Button>
      <Button 
        variant={filtroEstado === "Enviado" ? "primary" : "outline-primary"}
        onClick={() => filtrarPedidos("Enviado")}
        size="sm"
      >
        Enviado
      </Button>
      <Button 
        variant={filtroEstado === "Entregado" ? "primary" : "outline-primary"}
        onClick={() => filtrarPedidos("Entregado")}
        size="sm"
      >
        Entregado
      </Button>
    </div>
  </div>

  {/* Tabla responsive - Versión para desktop */}
  <div className="d-none d-lg-block">
    <div className="table-responsive">
      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>ID Pedido</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pedidosFiltrados.length > 0 ? (
            pedidosFiltrados.map((pedido) => (
              <tr key={pedido.ID_Pedido}>
                <td>{pedido.ID_Pedido}</td>
                <td>
                  <span className={`badge ${
                    pedido.Estado === "Procesando" ? "bg-warning text-dark" :
                    pedido.Estado === "Enviado" ? "bg-info text-white" :
                    pedido.Estado === "Entregado" ? "bg-success text-white" : "bg-secondary text-white"
                  }`}>
                    {pedido.Estado}
                  </span>
                </td>
                <td>{new Date(pedido.Fecha).toLocaleString()}</td>
                <td>${parseFloat(pedido.Total).toFixed(2)}</td>
                <td className="d-flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handlePagar(pedido.ID_Pedido)}
                    disabled={pedido.Estado === "Enviado" || pedido.Estado === "Entregado"}
                  >
                    {pedido.Estado === "Enviado" || pedido.Estado === "Entregado" ? "Pagado" : "Pagar"}
                  </Button>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => navigate(`/factura/${pedido.ID_Pedido}`)}
                  >
                    <i className="fas fa-file-invoice"></i> Factura
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-4">
                No hay pedidos con el estado seleccionado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>

  {/* Versión para móviles */}
  <div className="d-lg-none">
    {pedidosFiltrados.length > 0 ? (
      pedidosFiltrados.map((pedido) => (
        <div key={pedido.ID_Pedido} className="card mb-3 shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-2">
              <span className="fw-bold">ID:</span>
              <span>{pedido.ID_Pedido}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="fw-bold">Estado:</span>
              <span className={`badge ${
                pedido.Estado === "Procesando" ? "bg-warning text-dark" :
                pedido.Estado === "Enviado" ? "bg-info text-white" :
                pedido.Estado === "Entregado" ? "bg-success text-white" : "bg-secondary text-white"
              }`}>
                {pedido.Estado}
              </span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="fw-bold">Fecha:</span>
              <span>{new Date(pedido.Fecha).toLocaleDateString()}</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span className="fw-bold">Total:</span>
              <span>${parseFloat(pedido.Total).toFixed(2)}</span>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-grow-1"
                onClick={() => handlePagar(pedido.ID_Pedido)}
                disabled={pedido.Estado === "Enviado" || pedido.Estado === "Entregado"}
              >
                {pedido.Estado === "Enviado" || pedido.Estado === "Entregado" ? "Pagado" : "Pagar"}
              </Button>
              <Button
                variant="info"
                size="sm"
                className="flex-grow-1"
                onClick={() => navigate(`/factura/${pedido.ID_Pedido}`)}
              >
                <i className="fas fa-file-invoice"></i> Factura
              </Button>
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className="alert alert-info text-center py-4">
        No hay pedidos con el estado seleccionado
      </div>
    )}
  </div>
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
    </>
  );
};

export default Pedidos;