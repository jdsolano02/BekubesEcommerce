import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "./StyleGestionP.css"; 


const GestionProductos = () => {
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState(0);
  const [stock, setStock] = useState(0);
  const [tipo, setTipo] = useState("");
  const [dificultad, setDificultad] = useState("");
  const [imagen, setImagen] = useState(null); // Estado para la imagen
  const [editarId, setEditarId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const adminEmail = localStorage.getItem("email");

  // hacer el logout
  const handleLogout = async () => {
    await fetch(
      "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/logout.php"
    );
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  // Obtener productos
  const obtenerProductos = async () => {
    try {
      const response = await fetch(
        "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/obtenerProductos.php"
      );
      if (!response.ok) {
        throw new Error("Error al obtener los productos");
      }
      const rawData = await response.text();  // Leemos la respuesta como texto
      console.log("Respuesta cruda del servidor:", rawData);  // Imprimimos la respuesta
   
      // Intentamos convertirla en JSON
      const data = JSON.parse(rawData);  
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
// Función para convertir imagen a Base64
const convertirImagenABase64 = async (imagen) => {
  return new Promise((resolve, reject) => {
    if (!imagen) return resolve(null);
    const reader = new FileReader();
    reader.readAsDataURL(imagen);
    reader.onload = () => resolve(reader.result.split(",")[1]); // Extraer base64
    reader.onerror = (error) => reject(error);
  });
};
  const guardarProducto = async (e) => {
    e.preventDefault();
    e.stopPropagation(); 

    try {
      let imagenBase64 = null;

      // Si el usuario seleccionó una nueva imagen, conviértela a base64
      if (imagen instanceof File) {
        imagenBase64 = await convertirImagenABase64(imagen);
      } else if (imagen) {
        // Si no hay una nueva imagen, usa la imagen actual (base64 almacenado en la base de datos)
        imagenBase64 = imagen;
      }

      // Crear objeto con los datos del producto
      const datos = {
        nombre,
        descripcion,
        precio,
        stock,
        tipo,
        dificultad,
        imagen: imagenBase64, // Enviar la imagen en base64 o la ruta actual
        id: editarId, // ID en caso de edición
      };

      const url = editarId
        ? "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/editarProducto.php"
        : "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/agregarProducto.php";

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Enviar JSON
        },
        body: JSON.stringify(datos),
      });

      if (!response.ok) {
        throw new Error("Error al guardar el producto");
      }

      const data = await response.json();
    if (data.status === "success") {
      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: editarId
          ? "Producto actualizado correctamente."
          : "Producto agregado correctamente.",
      });
      
      // Limpia el formulario antes de actualizar la lista
      setNombre("");
      setDescripcion("");
      setPrecio(0);
      setStock(0);
      setTipo("");
      setDificultad("");
      setImagen(null);
      setEditarId(null);
      
      // Espera un momento antes de actualizar
      setTimeout(() => {
        obtenerProductos();
      }, 300);
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message,
    });
  } finally {
    setLoading(false);
  }
  };
  // Eliminar producto
  const eliminarProducto = async (id) => {
    try {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Quieres deshabilitar este producto?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, deshabilitar",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        const response = await fetch(
          "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/eliminarProducto.php",
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, accion: "deshabilitar" }), // Enviar acción
          }
        );

        if (!response.ok) {
          throw new Error("Error al deshabilitar el producto");
        }

        const data = await response.json();
        if (data.status === "success") {
          Swal.fire({
            icon: "success",
            title: "Éxito",
            text: data.message,
          });
          obtenerProductos(); // Actualizar la lista de productos
        } else {
          throw new Error(data.message);
        }
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    }
  };

  const habilitarProducto = async (id) => {
    try {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Quieres habilitar este producto?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, habilitar",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        const response = await fetch(
          "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/eliminarProducto.php",
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, accion: "habilitar" }), // Enviar acción
          }
        );

        if (!response.ok) {
          throw new Error("Error al habilitar el producto");
        }

        const data = await response.json();
        if (data.status === "success") {
          Swal.fire({
            icon: "success",
            title: "Éxito",
            text: data.message,
          });
          obtenerProductos(); // Actualizar la lista de productos
        } else {
          throw new Error(data.message);
        }
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    }
  };

  // Cargar productos al inicio
  useEffect(() => {
    obtenerProductos();
  }, []);

  if (loading) {
    return <p>Cargando productos...</p>;
  }

  return (
    <>
      <div>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container-fluid">
            <a className="navbar-brand" href="/admin-home">
              Panel Administrador
            </a>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav me-auto">
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    onClick={() => navigate("/usuarios")}
                  >
                    Usuarios
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    onClick={() => navigate("/register-admin")}
                  >
                    Crear Usuarios
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    onClick={() => navigate("/inventario")}
                  >
                    Inventario
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    onClick={() => navigate("/gestion-productos")}
                  >
                    Gestionar Productos
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    onClick={() => navigate("/pedidos-admin")}
                  >
                    Pedido Usuarios
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    onClick={() => navigate("/admin-torneo")}
                  >
                    Torneos
                  </button>
                </li>
              </ul>
              <span className="navbar-text text-white me-3">
                Bienvenido, {adminEmail}
              </span>
              <button className="btn btn-danger" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>
          </div>
        </nav>
      </div>

      <div className="container">
        <h1 className="text-center my-4">Gestión de Productos</h1>
        {/* Formulario responsive */}
        <div className="row justify-content-center">
          <div className="col-lg-6 mb-4">
            <div className="card">
              <div className="card-body">
                <h2 className="card-title h5">
                  {editarId ? "Editar Producto" : "Agregar Producto"}
                </h2>
                <form onSubmit={guardarProducto}>
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Precio en USD</label>
                    <input
                      type="number"
                      className="form-control"
                      value={precio}
                      onChange={(e) => setPrecio(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Stock</label>
                    <input
                      type="number"
                      className="form-control"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tipo</label>
                    <select
                      className="form-control"
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value)}
                      required
                    >
                      <option value="">Seleccione un tipo</option>
                      <option value="2x2">2x2</option>
                      <option value="3x3">3x3</option>
                      <option value="4x4">4x4</option>
                      <option value="6x6">6x6</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Dificultad</label>
                    <select
                      className="form-control"
                      value={dificultad}
                      onChange={(e) => setDificultad(e.target.value)}
                      required
                    >
                      <option value="">Seleccione dificultad</option>
                      <option value="Básico">Básico</option>
                      <option value="Intermedio">Intermedio</option>
                      <option value="Avanzado">Avanzado</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Imagen</label>
                    {editarId && ( // Mostrar la imagen actual solo en modo edición
                      <div>
                        <img
                          src={`http://localhost//Ecommerce-GestionInventario-TorneoBekubes/BackEnd/${imagen}`} // URL completa de la imagen
                          alt="Imagen actual"
                          style={{
                            width: "200px",
                            height: "200px",
                            marginBottom: "10px",
                          }}
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => setImagen(e.target.files[0])} // Manejar la selección de la imagen
                      accept="image/*" // Aceptar solo archivos de imagen
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{backgroundColor:'#ff6347'}}>
                    {editarId ? "Actualizar Producto" : "Agregar Producto"}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Lista de productos */}
          <div className="col-lg-12">
            <h2 className="my-4">Lista de Productos</h2>

            {/* Versión para móviles */}
            <div className="d-md-none">
              {productos.map((producto) => (
                <div key={producto.ID_Producto} className="card mb-3">
                  <div className="row g-0">
                    {producto.Imagen && (
                      <div className="col-4">
                        <img
                          src={`data:image/jpeg;base64,${producto.Imagen}`}
                          className="img-fluid rounded-start"
                          alt={producto.Nombre}
                        />
                      </div>
                    )}
                    <div className={producto.Imagen ? "col-8" : "col-12"}>
                      <div className="card-body">
                        <h5 className="card-title">{producto.Nombre}</h5>
                        <p className="card-text text-truncate">
                          {producto.Descripcion}
                        </p>
                        <div className="d-flex justify-content-between">
                          <span>${producto.Precio.toFixed(2)}</span>
                          <span>Stock: {producto.Stock}</span>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                          <span
                            className={`badge ${
                              producto.Estado === 0 ? "bg-success" : "bg-danger"
                            }`}
                          >
                            {producto.Estado === 0
                              ? "Habilitado"
                              : "Deshabilitado"}
                          </span>
                          <div>
                            <button
                              className="btn btn-sm btn-warning me-2"
                              onClick={() => {
                                setNombre(producto.Nombre);
                                setDescripcion(producto.Descripcion);
                                setPrecio(producto.Precio);
                                setStock(producto.Stock);
                                setTipo(producto.Tipo);
                                setDificultad(producto.Dificultad);
                                setImagen(producto.Imagen);
                                setEditarId(producto.ID_Producto);
                              }}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            {producto.Estado === 0 ? (
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() =>
                                  eliminarProducto(producto.ID_Producto)
                                }
                              >
                                <i className="bi bi-x-circle"></i>
                              </button>
                            ) : (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() =>
                                  habilitarProducto(producto.ID_Producto)
                                }
                              >
                                <i className="bi bi-check-circle"></i>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Versión para desktop */}
            <div className="d-none d-md-block">
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Imagen</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((producto) => (
                      <tr key={producto.ID_Producto}>
                        <td>{producto.Nombre}</td>
                        <td
                          className="text-truncate"
                          style={{ maxWidth: "200px" }}
                        >
                          {producto.Descripcion}
                        </td>
                        <td>${producto.Precio.toFixed(2)}</td>
                        <td>{producto.Stock}</td>
                        <td>
                          {producto.Imagen && (
                            <img
                              src={`data:image/jpeg;base64,${producto.Imagen}`}
                              alt={producto.Nombre}
                              className="img-thumbnail"
                              style={{ width: "50px", height: "50px" }}
                            />
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              producto.Estado === 0 ? "bg-success" : "bg-danger"
                            }`}
                          >
                            {producto.Estado === 0
                              ? "Habilitado"
                              : "Deshabilitado"}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-warning"
                              onClick={() => {
                                setNombre(producto.Nombre);
                                setDescripcion(producto.Descripcion);
                                setPrecio(producto.Precio);
                                setStock(producto.Stock);
                                setTipo(producto.Tipo);
                                setDificultad(producto.Dificultad);
                                setImagen(producto.Imagen);
                                setEditarId(producto.ID_Producto);
                              }}
                            >
                              Editar
                            </button>
                            {producto.Estado === 0 ? (
                              <button
                                className="btn btn-danger"
                                onClick={() =>
                                  eliminarProducto(producto.ID_Producto)
                                }
                              >
                                Deshab.
                              </button>
                            ) : (
                              <button
                                className="btn btn-success"
                                onClick={() =>
                                  habilitarProducto(producto.ID_Producto)
                                }
                              >
                                Habilitar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GestionProductos;
