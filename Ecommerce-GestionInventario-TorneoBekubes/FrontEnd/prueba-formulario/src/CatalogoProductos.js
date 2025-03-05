import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css"; // Importar Bootstrap CSS
import {
  Navbar,
  Nav,
  Container,
  Button,
  Row,
  Col,
  NavDropdown,
  Modal,
  Form,
} from "react-bootstrap";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";

const CatalogoProductos = () => {
  const [productos, setProductos] = useState([]);
  const [cantidadCarrito, setCantidadCarrito] = useState(0); // Estado para el contador del carrito
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState(""); // Filtro por tipo
  const [filtroDificultad, setFiltroDificultad] = useState(""); // Filtro por nivel de dificultad
  const [filtroPrecio, setFiltroPrecio] = useState(""); // Filtro por precio

  const navigate = useNavigate();

  // Obtener productos
  const obtenerProductos = async () => {
    try {
      const response = await fetch(
        "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/obtenerProductos.php"
      );
      if (!response.ok) {
        throw new Error("Error al obtener los productos");
      }
      const data = await response.json();
      if (data.status === "success") {
        setProductos(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setError(error.message);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Agregar producto al carrito
  const agregarAlCarrito = async (producto) => {
    const idUsuario = localStorage.getItem("user_id");

    // Verificar si el usuario ha iniciado sesión
    if (!idUsuario) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Debes iniciar sesión para agregar productos al carrito.",
        });
        return;
    }

    // Recuperar el carrito actual del localStorage
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    // Verificar si el producto ya está en el carrito
    const productoExistente = carrito.find(
        (item) => item.ID_Producto === producto.ID_Producto
    );

    if (productoExistente) {
        // Si ya está, incrementar la cantidad (se verifica que no pase de un límite si es necesario)
        productoExistente.Cantidad++;
    } else {
        // Si no está, agregarlo al carrito con cantidad inicial 1
        carrito.push({ ...producto, Cantidad: 1 });
    }

    // Guardar el carrito actualizado en localStorage
    localStorage.setItem("carrito", JSON.stringify(carrito));

    // Actualizar el estado de la cantidad del carrito (total de productos)
    const nuevaCantidad = carrito.reduce(
        (total, item) => total + item.Cantidad,
        0
    );
    setCantidadCarrito(nuevaCantidad);

    // Mostrar mensaje de éxito
    Swal.fire({
        icon: "success",
        title: "Producto agregado",
        text: "El producto se ha añadido a tu carrito.",
    });
};

  // Función para cerrar sesión
  const handleLogout = async () => {
    await fetch(
      "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/logout.php"
    );
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  // Abrir modal con los detalles del producto
  const handleShowModal = (producto) => {
    setSelectedProduct(producto); // Establecer el producto seleccionado
    setShowModal(true); // Mostrar el modal
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false); // Ocultar el modal
  };

  // Cargar productos al inicio
  useEffect(() => {
    obtenerProductos();
  }, []);
  useEffect(() => {
    // Recuperamos el carrito del localStorage
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    // Calculamos la cantidad total de productos en el carrito
    const cantidadTotal = carrito.reduce(
      (total, item) => total + item.Cantidad,
      0
    );

    // Actualizamos el estado
    setCantidadCarrito(cantidadTotal);
  }, []);

  // Filtrar productos
  const productosFiltrados = productos.filter((producto) => {
    return (
      producto.Estado === 0 && // Solo mostrar productos con estado = 0 (habilitados)
      (filtroTipo === "" || producto.Tipo === filtroTipo) &&
      (filtroDificultad === "" || producto.Dificultad === filtroDificultad) &&
      (filtroPrecio === "" || producto.Precio <= parseFloat(filtroPrecio))
    );
  });

  if (loading) {
    return <p>Cargando productos...</p>;
  }

  return (
    <div>
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

      {/* Contenido Principal */}
      <div style={{ paddingTop: "200px" }}>
        <Container>
          <h1 className="text-center my-4">Catálogo de Productos</h1>

          {/* Filtros */}
          <div className="mb-4">
            <Form>
              <Row>
                <Col md={4}>
                  <Form.Group controlId="filtroTipo">
                    <Form.Label>Tipo</Form.Label>
                    <Form.Control
                      as="select"
                      value={filtroTipo}
                      onChange={(e) => setFiltroTipo(e.target.value)}
                    >
                      <option value="">Todos</option>
                      <option value="2x2">2x2</option>
                      <option value="3x3">3x3</option>
                      <option value="4x4">4x4</option>
                      <option value="6x6">6x6</option>
                      {/* Agrega más opciones según tus productos */}
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="filtroDificultad">
                    <Form.Label>Nivel de Dificultad</Form.Label>
                    <Form.Control
                      as="select"
                      value={filtroDificultad}
                      onChange={(e) => setFiltroDificultad(e.target.value)}
                    >
                      <option value="">Todos</option>
                      <option value="Básico">Básico</option>
                      <option value="Intermedio">Intermedio</option>
                      <option value="Avanzado">Avanzado</option>
                      {/* Agrega más opciones según tus productos */}
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="filtroPrecio">
                    <Form.Label>Precio Máximo</Form.Label>
                    <Form.Control
                      type="number"
                      value={filtroPrecio}
                      onChange={(e) => setFiltroPrecio(e.target.value)}
                      placeholder="Precio máximo"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </div>

          {/* Lista de Productos Filtrados */}
          <div className="row">
            {productosFiltrados.map((producto) => (
              <div key={producto.ID_Producto} className="col-md-4 mb-4">
                <div className="card">
                  {/* Mostrar la imagen */}
                  <img
                    src={`data:image/jpeg;base64,${producto.Imagen}`} // Si usas Base64
                    // src={producto.Imagen} // Si usas URLs de archivos
                    className="card-img-top"
                    alt={producto.Nombre}
                    style={{ height: "300px", objectFit: "cover" }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{producto.Nombre}</h5>
                    <button
                      className="btn btn-primary me-2"
                      onClick={() => agregarAlCarrito(producto)}
                      disabled={producto.Stock <= 0}
                    >
                      {producto.Stock <= 0 ? "Agotado" : "Agregar al carrito"}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleShowModal(producto)}
                    >
                      Detalle
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Modal para Detalles del Producto */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedProduct?.Nombre}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <>
              <p>
                <strong>Descripción:</strong> {selectedProduct.Descripcion}
              </p>
              <p>
                <strong>Precio:</strong> ₡{selectedProduct.Precio.toFixed(2)}
              </p>
              <p>
                <strong>Stock:</strong> {selectedProduct.Stock}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Footer */}
      <footer
        style={{
          background: "#696969",
          color: "#fff",
          padding: "15px 0",
          height: "300px",
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
    </div>
  );
};

export default CatalogoProductos;
