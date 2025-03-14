CREATE DATABASE PlataformaBekubes;
USE PlataformaBekubes;
CREATE TABLE Usuarios (
    ID_Usuario INT PRIMARY KEY AUTO_INCREMENT,
    Nombre VARCHAR(50),
    Apellido1 VARCHAR(50),
    Apellido2 VARCHAR(50),
    Email VARCHAR(100) UNIQUE,
    Password VARCHAR(255),
    Rol ENUM('Cliente', 'Administrador'),
    FechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE Historial_Usuarios (
    ID_HistorialU INT PRIMARY KEY AUTO_INCREMENT,
    UsuarioCreacion TIMESTAMP,
    UsuarioModificacion TIMESTAMP,
    ID_Usuario INT,
    FOREIGN KEY (ID_Usuario) REFERENCES Usuarios(ID_Usuario)
);
CREATE TABLE Reseñas (
    ID_Reseña INT PRIMARY KEY AUTO_INCREMENT,
    Comentario TEXT,
    Valoracion INT CHECK (Valoracion BETWEEN 1 AND 5),
    ID_Usuario INT,
    FOREIGN KEY (ID_Usuario) REFERENCES Usuarios(ID_Usuario)
);
CREATE TABLE Notificaciones (
    ID_Notificacion INT PRIMARY KEY AUTO_INCREMENT,
    Mensaje TEXT,
    Fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ID_Usuario INT,
    FOREIGN KEY (ID_Usuario) REFERENCES Usuarios(ID_Usuario)
);
CREATE TABLE Torneos (
    ID_Torneo INT PRIMARY KEY AUTO_INCREMENT,
    Nombre VARCHAR(100),
    Fecha DATE,
    Ubicacion VARCHAR(255),
    Categoria VARCHAR(50)
);
CREATE TABLE Productos (
    ID_Producto INT PRIMARY KEY AUTO_INCREMENT,
    Nombre VARCHAR(100),
    Descripcion TEXT,
    Precio DOUBLE
);
CREATE TABLE Carrito (
    ID_Carrito INT PRIMARY KEY AUTO_INCREMENT,
    Total DOUBLE,
    ID_Usuario INT,
    FOREIGN KEY (ID_Usuario) REFERENCES Usuarios(ID_Usuario)
);
CREATE TABLE Items_Carrito (
    ID_Item INT PRIMARY KEY AUTO_INCREMENT,
    ID_Carrito INT,
    ID_Producto INT,
    Cantidad INT,
    Subtotal DOUBLE,
    FOREIGN KEY (ID_Carrito) REFERENCES Carrito(ID_Carrito),
    FOREIGN KEY (ID_Producto) REFERENCES Productos(ID_Producto)
);
CREATE TABLE Pedidos (
    ID_Pedido INT PRIMARY KEY AUTO_INCREMENT,
    Estado ENUM('Procesando', 'Enviado', 'Entregado'),
    ID_Carrito INT,
    FOREIGN KEY (ID_Carrito) REFERENCES Carrito(ID_Carrito)
);
CREATE TABLE Pagos (
    ID_Pago INT PRIMARY KEY AUTO_INCREMENT,
    Monto_Total DOUBLE,
    Estado ENUM('Pendiente', 'Completado', 'Cancelado'),
    ID_Pedido INT,
    FOREIGN KEY (ID_Pedido) REFERENCES Pedidos(ID_Pedido)
);
CREATE TABLE Metodo_Pago (
    ID_MetodoPago INT PRIMARY KEY AUTO_INCREMENT,
    Tipo ENUM('Tarjeta', 'PayPal', 'SINPE Movil'),
    Detalle TEXT,
    ID_Pago INT,
    FOREIGN KEY (ID_Pago) REFERENCES Pagos(ID_Pago)
);
CREATE TABLE Inventario (
    ID_Inventario INT PRIMARY KEY AUTO_INCREMENT,
    ID_Producto INT,
    Cantidad_Disponible INT,
    Cantidad_Minima INT,
    FechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FechaModificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	FOREIGN KEY (ID_Producto) REFERENCES Productos(ID_Producto)
);

ALTER TABLE Usuarios
ADD Verificado BOOLEAN DEFAULT 0, 
ADD TokenVerificacion VARCHAR(255), 
ADD FechaLimiteVerificacion TIMESTAMP; 

ALTER TABLE Usuarios
ADD COLUMN reset_token VARCHAR(255) NULL,
ADD COLUMN token_expiration DATETIME NULL,
ADD Estado BOOLEAN DEFAULT 0;

-- Primero eliminar la tabla inventario--
DROP TABLE Inventario;
--Luego agregar todos estas columnas de más en productos--
ALTER TABLE Productos
ADD COLUMN Tipo VARCHAR(255),
ADD COLUMN Dificultad VARCHAR(255),
ADD COLUMN Imagen LONGBLOB,
ADD COLUMN Estado BOOLEAN DEFAULT 0;
-- Y por ultimo eleimnar la columna Stock en productos--
ALTER TABLE Productos DROP COLUMN Stock;
-- Y luego volver a crear la tabla Inventario que esta arriba ya modificada--

--Ahora para los pedidos hacer estas modificaciones--
ALTER TABLE pedidos
DROP FOREIGN key pedidos_ibfk_1;
ALTER TABLE pedidos
ADD COLUMN Fecha  DATETIME DEFAULT CURRENT_TIMESTAMP;

ADD COLUMN Email  VARCHAR(255);
ALTER TABLE pedidos
ADD COLUMN ID_Usuario VARCHAR(255);
ALTER TABLE Pedidos DROP COLUMN ID_Carrito;
-- luego crear esta nueva tabla ---
CREATE TABLE PedidoDetalles (
    ID_Detalle INT PRIMARY KEY AUTO_INCREMENT,
    ID_Pedido INT,
    ID_Producto INT,
    Cantidad INT,
    Precio DECIMAL(10,2),
    FOREIGN KEY (ID_Pedido) REFERENCES Pedidos(ID_Pedido),
    FOREIGN KEY (ID_Producto) REFERENCES Productos(ID_Producto)
);
--- Crear tabla facturas para guardarlas----
CREATE TABLE Facturas (
    ID_Factura INT PRIMARY KEY AUTO_INCREMENT,
    ID_Pedido INT NOT NULL,
    Ruta_PDF VARCHAR(255) NOT NULL,
    Fecha_Creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ID_Pedido) REFERENCES Pedidos(ID_Pedido)
);