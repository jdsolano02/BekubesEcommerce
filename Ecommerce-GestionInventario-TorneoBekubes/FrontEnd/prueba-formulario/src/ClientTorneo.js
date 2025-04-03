import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Button, Row, Col, Table, Alert, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";

const ClienteTorneos = () => {
  const [torneos, setTorneos] = useState([]);
  const [misInscripciones, setMisInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [cantidadCarrito, setCantidadCarrito] = useState(0);
  // Función para cerrar sesión
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
  // Obtener usuario del localStorage
  const getUsuario = () => {
    const user = localStorage.getItem('user_id');
    return user ? { id: parseInt(user) } : null;
  };

  // Obtener torneos disponibles
  const fetchTorneos = async () => {
    try {
      const response = await axios.get('http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/torneos.php');
      setTorneos(response.data);
    } catch (error) {
      console.error('Error al obtener torneos:', error);
      Swal.fire('Error', 'No se pudieron cargar los torneos', 'error');
    }
  };

  // Obtener mis inscripciones
  const fetchMisInscripciones = async () => {
    const usuario = getUsuario();
    if (!usuario) return;

    try {
      const response = await axios.get(
        `http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/inscripciones.php?usuario_id=${usuario.id}`
      );
      setMisInscripciones(response.data);
    } catch (error) {
      console.error('Error al obtener inscripciones:', error);
    }
  };

  // Inscribirse a un torneo
  const handleInscripcion = async (torneoId) => {
    const usuario = getUsuario();
    if (!usuario) {
      Swal.fire('Error', 'Debes iniciar sesión para inscribirte', 'error');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/inscripciones.php',
        {
          usuario_id: usuario.id,
          torneo_id: torneoId
        }
      );

      Swal.fire('¡Inscrito!', response.data.message, 'success');
      fetchMisInscripciones(); // Actualizar lista de inscripciones
    } catch (error) {
      console.error('Error al inscribirse:', error);
      Swal.fire('Error', error.response?.data?.error || 'Error al inscribirse', 'error');
    }
  };

  // Cancelar inscripción
  const handleCancelarInscripcion = async (inscripcionId) => {
    const usuario = getUsuario();
    if (!usuario) return;

    try {
      const result = await Swal.fire({
        title: '¿Cancelar inscripción?',
        text: "¿Estás seguro de que deseas cancelar tu inscripción?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'No, mantener'
      });

      if (result.isConfirmed) {
        await axios.put(
          'http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/inscripciones.php',
          {
            inscripcion_id: inscripcionId,
            usuario_id: usuario.id
          }
        );

        Swal.fire('Cancelada', 'Tu inscripción ha sido cancelada', 'success');
        fetchMisInscripciones(); // Actualizar lista
      }
    } catch (error) {
      console.error('Error al cancelar inscripción:', error);
      Swal.fire('Error', error.response?.data?.error || 'Error al cancelar', 'error');
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

  if (loading) return <Container className="mt-5"><p>Cargando...</p></Container>;

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
            <Nav
              Nav
              className="ms-auto d-flex flex-nowrap"
              style={{ overflowX: "auto", whiteSpace: "nowrap" }}
            >
              <Nav.Link href="/catalogo-productos" className="mx-2">
                Catalogo de Productos
              </Nav.Link>
              <Nav.Link href="/carrito" className="mx-2">
                Carrito (
                <span style={{ color: "red", fontWeight: "bold" }}>
                  {cantidadCarrito}
                </span>
                )
              </Nav.Link>
              <Nav.Link href="/pedido" className="mx-2">
                Mis Pedidos
              </Nav.Link>
              <Nav.Link href="/sobre-nosotros" className="mx-2">
                Sobre Nosotros
              </Nav.Link>
              <Nav.Link href="/client-torneo" className="mx-2">
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
              >
                <NavDropdown.Item onClick={handleLogout}>
                  Cerrar sesión
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container style={{ marginTop: "15rem" }}>
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
                      <Button variant="success" disabled>
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
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {misInscripciones.length > 0 ? (
                misInscripciones.map((inscripcion) => {
                  const fechaTorneo = new Date(inscripcion.Fecha);
                  const hoy = new Date();
                  const torneoConcluido = fechaTorneo < hoy;
                  const torneoCancelado = inscripcion.torneo_estado === 0; // Asumiendo que torneo_estado viene en los datos

                  return (
                    <tr key={inscripcion.ID_Inscripcion}>
                      <td>
                        {inscripcion.torneo_nombre}
                        {torneoCancelado && (
                          <span className="badge bg-danger ms-2">
                            Cancelado
                          </span>
                        )}
                      </td>
                      <td>
                        {fechaTorneo.toLocaleDateString()}
                        {torneoConcluido && !torneoCancelado && (
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
                              handleCancelarInscripcion(
                                inscripcion.ID_Inscripcion
                              )
                            }
                            disabled={torneoConcluido || torneoCancelado}
                          >
                            {torneoCancelado
                              ? "Torneo cancelado"
                              : torneoConcluido
                              ? "No cancelable"
                              : "Cancelar"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
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

export default ClienteTorneos;