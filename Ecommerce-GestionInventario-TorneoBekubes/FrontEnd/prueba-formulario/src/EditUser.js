import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./stylesU.css"; 
import Swal from "sweetalert2"; 

const EditUser = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [user, setUser] = useState({
    ID_Usuario: "",
    nombre: "",
    apellido1: "",
    apellido2: "",
    email: "",
    Rol: "",
    FechaCreacion: "",
  });

  
  useEffect(() => {
    fetch(`http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/getClienteById.php?id=${id}`)
      .then((response) => response.json())
      .then((data) => setUser(data))
      .catch((error) => {
        console.error("Error al obtener el usuario", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cargar la información del usuario.",
        });
      });
  }, [id]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  // Manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/updateUsuario.php?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ID_Usuario: user.ID_Usuario,
        nombre: user.nombre,
        apellido1: user.apellido1,
        apellido2: user.apellido2,
        email: user.email,
        Rol: user.Rol,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error en la respuesta del servidor");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: data.success,
          }).then(() => {
            navigate("/usuarios"); 
          });
        } else if (data.error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: data.error,
          });
        }
      })
      .catch((error) => {
        console.error("Error al actualizar el usuario", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un problema al actualizar el usuario. Por favor, inténtalo de nuevo.",
        });
      });
  };

  return (
    <div className="container2">
      <h2>Editar Usuario</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre</label>
          <input
            type="text"
            name="nombre"
            value={user.nombre}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <label>Apellido 1</label>
          <input
            type="text"
            name="apellido1"
            value={user.apellido1}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <label>Apellido 2</label>
          <input
            type="text"
            name="apellido2"
            value={user.apellido2}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <label>Rol</label>
          <select
            name="Rol"
            value={user.Rol}
            onChange={handleChange}
            className="form-control"
            required
          >
            <option value="admin">Administrador</option>
            <option value="user">Cliente</option>
          </select>
        </div>
        <div className="form-group">
          <label>Fecha de Creación</label>
          <input
            type="text"
            name="FechaCreacion"
            value={user.FechaCreacion}
            onChange={handleChange}
            className="form-control"
            disabled
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Guardar Cambios
        </button>
        <button
          type="button"
          className="btn btn-secondary ml-2"
          onClick={() => navigate("/usuarios")}
        >
          Cancelar
        </button>
      </form>
    </div>
  );
};

export default EditUser;