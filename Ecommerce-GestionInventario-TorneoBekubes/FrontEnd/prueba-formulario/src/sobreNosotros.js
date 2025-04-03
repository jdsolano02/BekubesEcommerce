import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./SobreNosotros.css";

const SobreNosotros = () => {
  const [estaAbierto, setEstaAbierto] = useState("Cargando...");
  const [reseñas, setReseñas] = useState([]);
  const [nuevaReseña, setNuevaReseña] = useState({
    comentario: "",
    valoracion: 5,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Obtener usuario del localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user_id');
    if (userData) {
      // Llamada al backend para obtener datos reales del usuario
      fetch(`http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/obtener_usuario.php?id=${userData}`)
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setUsuario(data.usuario);
          }
        })
        .catch(() => {
          // Datos de prueba si falla la conexión
          setUsuario({
            id: userData,
            nombre: "Usuario",
            apellido1: "Ejemplo",
            apellido2: "Test"
          });
        });
    }
    setCargando(false);
  }, []);

  // Función para verificar horario de atención
  const verificarHorario = () => {
    const ahora = new Date();
    const horaActual = ahora.getHours();
    const minutosActuales = ahora.getMinutes();
    const horaApertura = 9;
    const horaCierre = 18;

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

  useEffect(() => {
    verificarHorario();
    const intervalo = setInterval(verificarHorario, 60000);
    cargarReseñas();
    return () => clearInterval(intervalo);
  }, []);

  const cargarReseñas = async () => {
    try {
      const response = await fetch('http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/obtener_resenas.php');
      const data = await response.json();
      if (data.success) {
        setReseñas(data.reseñas);
      } else {
        setError(data.message || "Error al cargar reseñas");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
      console.error("Error al cargar reseñas:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevaReseña(prev => ({
      ...prev,
      [name]: name === 'valoracion' ? parseInt(value) : value
    }));
  };

  const enviarReseña = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!usuario) {
      setError("Debes iniciar sesión para dejar una reseña");
      return;
    }

    if (!nuevaReseña.comentario.trim()) {
      setError("El comentario no puede estar vacío");
      return;
    }

    try {
      const response = await fetch('http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/guardar_resena.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...nuevaReseña,
          id_usuario: usuario.id
        })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      if (data.success) {
        setSuccess("Reseña enviada con éxito");
        setNuevaReseña({
          comentario: "",
          valoracion: 5
        });
        await cargarReseñas();
      } else {
        setError(data.message || "Error al enviar la reseña");
      }
    } catch (err) {
      setError(`Error de conexión: ${err.message}`);
      console.error("Error al enviar reseña:", err);
    }
  };

  const eliminarReseña = async (idReseña) => {
    const userId = localStorage.getItem('user_id');
    
    if (!userId) {
        setError("Usuario no identificado");
        return;
    }

    try {
        const response = await fetch(
            "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/eliminar_resena.php",
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id_usuario: userId
                }),
            }
        );

        const data = await response.json();

        if (data.success) {
            setSuccess(`Reseñas actualizadas: ${data.resenas_actualizadas}`);
            await cargarReseñas(); // Recargar la lista
        } else {
            setError(data.message || "Error al actualizar reseñas");
        }
    } catch (err) {
        setError("Error de conexión con el servidor");
        console.error("Error al actualizar reseñas:", err);
    }
};

  // Función para formatear la fecha
  const formatFecha = (fechaString) => {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fechaString).toLocaleDateString('es-ES', opciones);
  };
  const calcularPorcentajeRecomendacion = () => {
    if (reseñas.length === 0) return 0; // Si no hay reseñas, 0%
    
    // Contar reseñas con valoración >= 4 (consideradas positivas)
    const reseñasPositivas = reseñas.filter(reseña => reseña.Valoracion >= 4).length;
    
    // Calcular porcentaje (redondeado)
    const porcentaje = Math.round((reseñasPositivas / reseñas.length) * 100);
    
    return porcentaje;
  };
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
                  <strong>
                    Recomendado por el {calcularPorcentajeRecomendacion()}%
                  </strong>{" "}
                  ({reseñas.length} opiniones)
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Testimonios */}
        <Row className="mb-5">
          <Col>
            <h2 className="mb-4">Lo que dicen nuestros clientes</h2>

            {error && (
              <Alert variant="danger" onClose={() => setError("")} dismissible>
                {error}
              </Alert>
            )}
            {success && (
              <Alert
                variant="success"
                onClose={() => setSuccess("")}
                dismissible
              >
                {success}
              </Alert>
            )}

            <div className="testimonios-container">
              {reseñas.length > 0 ? (
                reseñas.map((reseña) => (
                  <Card key={reseña.ID_Reseña} className="mb-4 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <Card.Title className="mb-1">
                            {reseña.Nombre} {reseña.Apellido1}{" "}
                            {reseña.Apellido2}
                          </Card.Title>
                          <small className="text-muted">
                            {formatFecha(reseña.Fecha)}
                          </small>
                        </div>
                        <div className="d-flex align-items-center">
                          <div className="star-rating me-2">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={
                                  i < reseña.Valoracion
                                    ? "star-filled"
                                    : "star-empty"
                                }
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Card.Text className="reseña-text">
                        {reseña.Comentario}
                      </Card.Text>
                      {/* Botón Eliminar - Asegúrate que esta parte está presente */}
                      {usuario && usuario.id == reseña.ID_Usuario && (
                        <div className="text-end mt-2">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => eliminarReseña(reseña.ID_Reseña)}
                          >
                            <i className="bi bi-trash"></i> Eliminar
                          </Button>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                ))
              ) : (
                <Card className="text-center py-4">
                  <Card.Body>
                    <Card.Text>
                      No hay reseñas disponibles. Sé el primero en compartir tu
                      experiencia.
                    </Card.Text>
                  </Card.Body>
                </Card>
              )}
            </div>

            {usuario ? (
              <Card className="mt-4 shadow-sm">
                <Card.Body>
                  <Card.Title className="mb-3">Deja tu reseña</Card.Title>
                  <Form onSubmit={enviarReseña}>
                    <Form.Group className="mb-3">
                      <Form.Label>Valoración</Form.Label>
                      <Form.Select
                        name="valoracion"
                        value={nuevaReseña.valoracion}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="5">★★★★★ Excelente</option>
                        <option value="4">★★★★☆ Muy Bueno</option>
                        <option value="3">★★★☆☆ Bueno</option>
                        <option value="2">★★☆☆☆ Regular</option>
                        <option value="1">★☆☆☆☆ Malo</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Comentario</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="comentario"
                        value={nuevaReseña.comentario}
                        onChange={handleInputChange}
                        required
                        minLength="10"
                        maxLength="500"
                        placeholder="Comparte tu experiencia con nosotros (mínimo 10 caracteres)"
                      />
                    </Form.Group>
                    <div className="text-end">
                      <Button variant="primary" type="submit" className="px-4">
                        Enviar Reseña
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            ) : (
              !cargando && (
                <Alert variant="info" className="text-center">
                  <Alert.Link href="/login">Inicia sesión</Alert.Link> para
                  dejar una reseña sobre tu experiencia.
                </Alert>
              )
            )}
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
