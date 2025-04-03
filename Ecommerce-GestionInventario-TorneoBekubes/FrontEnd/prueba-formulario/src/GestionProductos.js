import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

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
      const data = JSON.parse(rawData);  // Usamos JSON.parse aquí
   
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
        obtenerProductos(); // Actualizar lista
        setNombre("");
        setDescripcion("");
        setPrecio(0);
        setStock(0);
        setTipo("");
        setDificultad("");
        setImagen(null);
        setEditarId(null);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
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
                <button className="nav-link btn btn-link" onClick={() => navigate("/pedidos-admin")}>Pedido Usuarios</button>
              </li>
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={() => navigate("/admin-torneo")}>Torneos</button>
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
            <label className="form-label">Precio</label>
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
            <input
              type="text"
              className="form-control"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Dificultad</label>
            <input
              type="text"
              className="form-control"
              value={dificultad}
              onChange={(e) => setDificultad(e.target.value)}
              required
            />
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
          <button type="submit" className="btn btn-primary">
            {editarId ? "Actualizar Producto" : "Agregar Producto"}
          </button>
        </form>

        <h2 className="my-4">Lista de Productos</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Imagen</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.ID_Producto}>
                <td>{producto.Nombre}</td>
                <td>{producto.Descripcion}</td>
                <td>₡{producto.Precio.toFixed(2)}</td>
                <td>{producto.Stock}</td>
                <td>
                  {producto.Imagen && (
                    <img
                      src={`data:image/jpeg;base64,${producto.Imagen}`} // Mostrar la imagen en base64
                      alt={producto.Nombre}
                      style={{ width: "50px", height: "50px" }}
                    />
                  )}
                </td>
                <td>
                  {producto.Estado === 0 ? "Habilitado" : "Deshabilitado"}
                </td>
                <td>
                  <button
                    className="btn btn-warning me-2"
                    onClick={() => {
                      setNombre(producto.Nombre);
                      setDescripcion(producto.Descripcion);
                      setPrecio(producto.Precio);
                      setStock(producto.Stock);
                      setTipo(producto.Tipo);
                      setDificultad(producto.Dificultad);
                      setImagen(producto.Imagen); // Usar el base64 de la imagen
                      setEditarId(producto.ID_Producto);
                    }}
                  >
                    Editar
                  </button>
                  {producto.Estado === 0 ? (
                    <button
                      className="btn btn-danger"
                      onClick={() => eliminarProducto(producto.ID_Producto)}
                    >
                      Deshabilitar
                    </button>
                  ) : (
                    <button
                      className="btn btn-success"
                      onClick={() => habilitarProducto(producto.ID_Producto)}
                    >
                      Habilitar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default GestionProductos;
