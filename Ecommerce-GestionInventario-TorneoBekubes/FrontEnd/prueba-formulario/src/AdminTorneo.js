import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Button, Modal, Form, Row, Col, ButtonGroup } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaArrowLeft, FaUsers } from 'react-icons/fa';

const AdminTorneo = () => {
  const [torneos, setTorneos] = useState([]);
  const adminEmail = localStorage.getItem("email");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTorneoNombre, setCurrentTorneoNombre] = useState('');
  const [currentTorneo, setCurrentTorneo] = useState({
    ID_Torneo: '',
    Nombre: '',
    Fecha: '',
    Ubicacion: '',
    Categoria: ''
  });
  
  const [showParticipantesModal, setShowParticipantesModal] = useState(false);
  const [participantes, setParticipantes] = useState([]);
  const [currentTorneoId, setCurrentTorneoId] = useState(null);
  
  const navigate = useNavigate();

  const categorias = [
    '3x3x3', '2x2x2', '4x4x4', '5x5x5', 
    '3x3x3 Blindfolded', '3x3x3 One-Handed',
    'Megaminx', 'Pyraminx', 'Skewb', 'Square-1'
  ];

  const fetchTorneos = async () => {
    try {
      const response = await axios.get('http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/torneos.php');
      setTorneos(response.data);
    } catch (error) {
      console.error('Error al obtener torneos:', error);
      Swal.fire('Error', 'No se pudieron cargar los torneos', 'error');
    }
  };

  useEffect(() => {
    fetchTorneos();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTorneo({
      ...currentTorneo,
      [name]: value
    });
  };

  const handleNewTorneo = () => {
    setCurrentTorneo({
      ID_Torneo: '',
      Nombre: '',
      Fecha: '',
      Ubicacion: '',
      Categoria: ''
    });
    setEditMode(false);
    setShowModal(true);
  };

  const handleEditTorneo = (torneo) => {
    const fechaFormateada = torneo.Fecha.includes('T') 
      ? torneo.Fecha.split('T')[0]
      : torneo.Fecha;
    
    setCurrentTorneo({
      ...torneo,
      Fecha: fechaFormateada
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      };

      if (editMode) {
        await axios.put(
          'http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/torneos.php',
          currentTorneo,
          config
        );
        
        await Swal.fire({
          title: '¡Éxito!',
          text: 'Torneo actualizado correctamente',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      } else {
        await axios.post(
          'http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/torneos.php',
          currentTorneo,
          config
        );
        
        await Swal.fire({
          title: '¡Éxito!',
          text: 'Torneo creado correctamente',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      }
      
      setShowModal(false);
      await fetchTorneos();
      
    } catch (error) {
      console.error('Error al guardar torneo:', error);
      
      let errorMessage = 'Ocurrió un error al guardar el torneo';
      if (error.response) {
        errorMessage += `: ${error.response.data.message || error.response.statusText}`;
      }
      
      Swal.fire('Error', errorMessage, 'error');
    }
  };

  const handleDeleteTorneo = async (id) => {
    const result = await Swal.fire({
      title: '¿Confirmar eliminación?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
  
    if (result.isConfirmed) {
      try {
        await axios.delete(
          `http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/torneos.php?id=${id}`,
          { 
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
          }
        );
        await Swal.fire(
          '¡Eliminado!',
          'El torneo ha sido eliminado.',
          'success'
        );
        
        await fetchTorneos();
      } catch (error) {
        console.error('Error al eliminar torneo:', error);
        
        let errorMessage = 'Ocurrió un error al eliminar el torneo';
        if (error.response) {
          errorMessage += `: ${error.response.data.message || error.response.statusText}`;
        }
        
        Swal.fire('Error', errorMessage, 'error');
      }
    }
  };

  const fetchParticipantes = async (torneoId, torneoNombre) => {
    try {
      const response = await axios.get(
        `http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/participantes.php?torneo_id=${torneoId}`
      );
      
      if (response.data.status === 'success') {
        setParticipantes(response.data.data);
      } else {
        setParticipantes([]);
        Swal.fire('Info', 'No hay participantes confirmados para este torneo', 'info');
      }
      
      setCurrentTorneoId(torneoId);
      setCurrentTorneoNombre(torneoNombre);
      setShowParticipantesModal(true);
      
    } catch (error) {
      console.error('Error al obtener participantes:', error);
      Swal.fire('Error', 'No se pudieron cargar los participantes', 'error');
    }
  };

  const handleLogout = async () => {
    await fetch("http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/logout.php");
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="/admin-home">Panel Administrador</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={() => navigate("/usuarios")}>Usuarios</button>
              </li>
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={() => navigate("/register-admin")}>Crear Usuarios</button>
              </li>
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={() => navigate("/inventario")}>Inventario</button>
              </li>
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={() => navigate("/gestion-productos")}>Gestionar Productos</button>
              </li>
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={() => navigate("/pedidos-admin")}>Pedidos Usuarios</button>
              </li>
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={() => navigate("/admin-torneo")}>Torneos</button>
              </li>
            </ul>
            <span className="navbar-text text-white me-3">Bienvenido, {adminEmail}</span>
            <button className="btn btn-danger" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </div>
      </nav>

      <Container className="mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Administración de Torneos</h2>
          <div>
            <Button variant="primary" onClick={handleNewTorneo} className="me-2">
              Nuevo Torneo
            </Button>
          </div>
        </div>
        
        <div className="table-responsive">
          <Table striped bordered hover className="mb-4">
            <thead className="table-dark">
              <tr>
                <th style={{ width: '5%' }}>ID</th>
                <th style={{ width: '25%' }}>Nombre</th>
                <th style={{ width: '15%' }}>Fecha</th>
                <th style={{ width: '25%' }}>Ubicación</th>
                <th style={{ width: '15%' }}>Categoría</th>
                <th style={{ width: '15%' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {torneos.map((torneo) => (
                <tr key={torneo.ID_Torneo}>
                  <td>{torneo.ID_Torneo}</td>
                  <td>{torneo.Nombre}</td>
                  <td>{new Date(torneo.Fecha).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit' 
                      })}
                  </td>
                  <td>{torneo.Ubicacion}</td>
                  <td>{torneo.Categoria}</td>
                  <td>
                    <ButtonGroup size="sm">
                      <Button 
                        variant="outline-primary" 
                        onClick={() => handleEditTorneo(torneo)}
                        title="Editar"
                        className="me-1"
                      >
                        <FaEdit />
                      </Button>
                      <Button 
                        variant="outline-info" 
                        onClick={() => fetchParticipantes(torneo.ID_Torneo, torneo.Nombre)}
                        title="Ver Participantes"
                        className="me-1"
                      >
                        <FaUsers />
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        onClick={() => handleDeleteTorneo(torneo.ID_Torneo)}
                        title="Eliminar"
                      >
                        <FaTrash />
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Modal para crear/editar torneo */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton className="bg-dark text-white">
            <Modal.Title>{editMode ? 'Editar Torneo' : 'Nuevo Torneo'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Form.Group as={Col} controlId="formNombre">
                  <Form.Label>Nombre del Torneo</Form.Label>
                  <Form.Control
                    type="text"
                    name="Nombre"
                    value={currentTorneo.Nombre}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group as={Col} controlId="formFecha">
                  <Form.Label>Fecha</Form.Label>
                  <Form.Control
                    type="date"
                    name="Fecha"
                    value={currentTorneo.Fecha}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Row>
              
              <Row className="mb-3">
                <Form.Group as={Col} controlId="formUbicacion">
                  <Form.Label>Ubicación</Form.Label>
                  <Form.Control
                    type="text"
                    name="Ubicacion"
                    value={currentTorneo.Ubicacion}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group as={Col} controlId="formCategoria">
                  <Form.Label>Categoría</Form.Label>
                  <Form.Select
                    name="Categoria"
                    value={currentTorneo.Categoria}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccione una categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Row>
              
              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                  Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  {editMode ? 'Actualizar' : 'Guardar'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Modal para participantes */}
        <Modal 
          show={showParticipantesModal} 
          onHide={() => setShowParticipantesModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton className="bg-dark text-white">
            <Modal.Title>
              Participantes del Torneo: {currentTorneoNombre}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {participantes.length > 0 ? (
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>Email</th>
                      <th>Fecha Inscripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participantes.map((participante, index) => (
                      <tr key={participante.ID_Participante}>
                        <td>{index + 1}</td>
                        <td>{participante.Nombre}</td>
                        <td>{participante.Apellido}</td>
                        <td>{participante.Email}</td>
                        <td>
                          {new Date(participante.Fecha_Inscripcion).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-4">
                <p>No hay participantes confirmados para el torneo "{currentTorneoNombre}"</p>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowParticipantesModal(false)}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default AdminTorneo;