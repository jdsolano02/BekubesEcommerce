import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Card,
  Button,
  Row,
  Col,
  Table,
  Alert,
  Navbar,
  Nav,
  NavDropdown,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaFacebook, FaInstagram, FaWhatsapp, FaCube } from "react-icons/fa";

const ClienteTorneos = () => {
  const [torneos, setTorneos] = useState([]);
  const [misInscripciones, setMisInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [cantidadCarrito, setCantidadCarrito] = useState(0);

  const handlePerfil = () => {
    navigate(`/client-perfil`);
  };
  // Función para cerrar sesión
  const handleLogout = async () => {
    await fetch(
      "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/logout.php"
    );
    localStorage.removeItem("carrito")
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
  // Obtener usuario del localStorage
  const getUsuario = () => {
    const user = localStorage.getItem("user_id");
    return user ? { id: parseInt(user) } : null;
  };

  // Obtener torneos disponibles
  const fetchTorneos = async () => {
    try {
      const response = await axios.get(
        "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/torneos.php"
      );
      setTorneos(response.data);
    } catch (error) {
      console.error("Error al obtener torneos:", error);
      Swal.fire("Error", "No se pudieron cargar los torneos", "error");
    }
  };

  // Obtener mis inscripciones
  const fetchMisInscripciones = async () => {
    const usuario = getUsuario();
    if (!usuario) {
      setMisInscripciones([]);
      return;
    }

    try {
      const { data } = await axios.get(
        `http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/inscripciones.php?usuario_id=${usuario.id}`
      );

      if (data.success && Array.isArray(data.data)) {
        setMisInscripciones(data.data);
      } else {
        throw new Error("Formato de respuesta inválido");
      }
    } catch (error) {
      console.error("Error:", error);
      setMisInscripciones([]);
      Swal.fire("Error", "Error al cargar inscripciones", "error");
    }
  };
  // Inscribirse a un torneo
  const handleInscripcion = async (torneoId) => {
    const usuario = getUsuario();
    if (!usuario) {
      Swal.fire("Error", "Debes iniciar sesión para inscribirte", "error");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/inscripciones.php",
        {
          usuario_id: usuario.id,
          torneo_id: torneoId,
        }
      );

      Swal.fire("¡Inscrito!", response.data.message, "success");
      fetchMisInscripciones(); // Actualizar lista de inscripciones
    } catch (error) {
      console.error("Error al inscribirse:", error);
      Swal.fire(
        "Error",
        error.response?.data?.error || "Error al inscribirse",
        "error"
      );
    }
  };

  // Cancelar inscripción
  const handleCancelarInscripcion = async (inscripcion) => {
    if (inscripcion.torneo_estado === 0) {
      Swal.fire(
        "Error",
        "No se puede cancelar la inscripción porque el torneo fue cancelado",
        "error"
      );
      return;
    }

    const result = await Swal.fire({
      title: "¿Cancelar inscripción?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No, mantener",
    });

    if (result.isConfirmed) {
      try {
        await axios.put(
          "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/inscripciones.php",
          {
            inscripcion_id: inscripcion.ID_Inscripcion,
            usuario_id: getUsuario().id,
          }
        );
        fetchMisInscripciones();
        Swal.fire("Cancelada", "Tu inscripción ha sido cancelada", "success");
      } catch (error) {
        Swal.fire(
          "Error",
          error.response?.data?.error || "Error al cancelar",
          "error"
        );
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchTorneos();
      await fetchMisInscripciones();
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading)
    return (
           <div className="fullscreen-loading">
             <div className="spinner-container">
               <FaCube className="cube-spinner" />
               <FaCube className="cube-spinner" />
             </div>
             <h2 className="loading-text">Cargando los torneos</h2>
             <p className="loading-subtext" style={{color:'black'}}>Estamos preparando todos los detalles...</p>
           </div>
         );

  return (
    <>
      {/* Navbar */}
      <Navbar
        bg="dark"
        expand="lg"
        className="fixed-top shadow-sm"
        style={{ minHeight: "100px" }}
      >
        <Container
          fluid="md"
          style={{ background: "#fff", borderRadius: "10px" }}
        >
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
                  onClick={handlePerfil}
                  style={{ color: "green" }}
                >
                  Perfil
                </NavDropdown.Item>
                <NavDropdown.Item
                  onClick={handleLogout}
                  style={{ color: "red" }}
                >
                  Cerrar sesión
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container style={{ marginTop: "10rem" }}>
        <h2 className="mb-4">Torneos Disponibles</h2>

        <Row className="g-4 mb-5">
          {torneos.map((torneo) => {
            const fechaTorneo = new Date(torneo.Fecha);
            const hoy = new Date();
            const torneoConcluido = fechaTorneo < hoy;
            const yaInscrito = misInscripciones.some(
              (i) =>
                i.torneo_id === torneo.ID_Torneo && i.estado === "confirmada"
            );
            const pendienteInscripcion = misInscripciones.some(
              (i) =>
                i.torneo_id === torneo.ID_Torneo && i.estado !== "confirmada"
            );

            return (
              <Col key={torneo.ID_Torneo} md={6} lg={4}>
                <Card>
                  <Card.Body>
                    <Card.Title>{torneo.Nombre}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      {fechaTorneo.toLocaleDateString()} - {torneo.Ubicacion}
                      {torneoConcluido && (
                        <span className="badge bg-secondary ms-2">
                          Concluido
                        </span>
                      )}
                    </Card.Subtitle>
                    <Card.Text>
                      <strong>Categoría:</strong> {torneo.Categoria}
                    </Card.Text>
                    {torneoConcluido ? (
                      <Button variant="secondary" disabled>
                        Concluido
                      </Button>
                    ) : yaInscrito ? (
                      <Button variant="success" disabled style={{backgroundColor:'#ff7f50'}}>
                        Inscrito
                      </Button>
                    ) : pendienteInscripcion ? (
                      <Button variant="warning" disabled>
                        Ya no puedes Inscribirte
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={() => handleInscripcion(torneo.ID_Torneo)}
                        style={{backgroundColor:'#ff6347'}}
                      >
                        Inscribirse
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>

        <h2 className="mb-4">Mis Inscripciones</h2>
        {getUsuario() ? (
          <Table striped bordered hover responsive className="mt-3">
            <thead className="table-dark">
              <tr>
                <th>Torneo</th>
                <th>Fecha</th>
                <th>Ubicación</th>
                <th>Estado Inscripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {misInscripciones.length > 0 ? (
                (() => {
                  const inscripcionesActivas = misInscripciones.filter(
                    (inscripcion) => inscripcion.torneo_estado !== 0
                  );

                  if (inscripcionesActivas.length === 0) {
                    return (
                      <tr>
                        <td colSpan="5" className="text-center py-4 fw-bold">
                          No tienes inscripciones activas
                        </td>
                      </tr>
                    );
                  }

                  return inscripcionesActivas.map((inscripcion) => {
                    const fechaTorneo = new Date(inscripcion.Fecha);
                    const hoy = new Date();
                    const torneoConcluido = fechaTorneo < hoy;

                    return (
                      <tr key={inscripcion.ID_Inscripcion}>
                        <td>{inscripcion.torneo_nombre}</td>
                        <td>
                          {fechaTorneo.toLocaleDateString()}
                          {torneoConcluido && (
                            <span className="badge bg-secondary ms-2">
                              Finalizado
                            </span>
                          )}
                        </td>
                        <td>{inscripcion.Ubicacion}</td>
                        <td>
                          <span
                            className={`badge ${
                              inscripcion.estado === "confirmada"
                                ? "bg-success"
                                : inscripcion.estado === "cancelada"
                                ? "bg-danger"
                                : "bg-warning"
                            }`}
                          >
                            {inscripcion.estado}
                          </span>
                        </td>
                        <td>
                          {inscripcion.estado === "confirmada" && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() =>
                                handleCancelarInscripcion(inscripcion)
                              }
                              disabled={torneoConcluido}
                            >
                              {torneoConcluido
                                ? "Finalizado"
                                : "Cancelar inscripción"}
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  });
                })()
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 fw-bold">
                    No tienes inscripciones activas
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        ) : (
          <Alert variant="info">Inicia sesión para ver tus inscripciones</Alert>
        )}
      </Container>

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

export default ClienteTorneos;
