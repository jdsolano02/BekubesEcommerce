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
    FechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Campos de verificación de email
    Verificado BOOLEAN DEFAULT FALSE,
    TokenVerificacion VARCHAR(255),
    FechaLimiteVerificacion TIMESTAMP,
    -- Campos para recuperación de contraseña
    reset_token VARCHAR(255),
    token_expiration DATETIME,
    -- Estado de la cuenta (activo/inactivo)
    Estado BOOLEAN DEFAULT FALSE,
    Telefono VARCHAR(10),
    Direccion VARCHAR(200)
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
    Fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ID_Usuario INT,
    Estado BOOLEAN DEFAULT 1 COMMENT '1=Activa, 0=Eliminada',
    likes INT DEFAULT 0,
    FOREIGN KEY (ID_Usuario) REFERENCES Usuarios(ID_Usuario)
);
CREATE TABLE Torneos (
    ID_Torneo INT PRIMARY KEY AUTO_INCREMENT,
    Nombre VARCHAR(100),
    Fecha DATE,
    Ubicacion VARCHAR(255),
    Categoria VARCHAR(50),
    Estado BOOLEAN DEFAULT 1 COMMENT '1=Activa, 0=Eliminada'
);
CREATE TABLE Inscripciones (
    ID_Inscripcion INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    torneo_id INT NOT NULL,
    fecha_inscripcion DATE NOT NULL,
    estado ENUM('pendiente', 'confirmada', 'cancelada') DEFAULT 'pendiente',
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(ID_Usuario),
    FOREIGN KEY (torneo_id) REFERENCES Torneos(ID_Torneo)
);
CREATE TABLE Productos (
    ID_Producto INT PRIMARY KEY AUTO_INCREMENT,
    Nombre VARCHAR(100),
    Descripcion TEXT,
    Precio DOUBLE,
    -- Nuevos campos añadidos
    Tipo VARCHAR(255),
    Dificultad VARCHAR(255),
    Imagen LONGBLOB,
    Estado BOOLEAN DEFAULT FALSE
);
CREATE TABLE Pedidos (
    ID_Pedido INT PRIMARY KEY AUTO_INCREMENT,
    Estado ENUM('Procesando', 'Enviado', 'Entregado'),
    ID_Usuario INT,
    Email  VARCHAR(255),
    Fecha  DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE PedidoDetalles (
    ID_Detalle INT PRIMARY KEY AUTO_INCREMENT,
    ID_Pedido INT,
    ID_Producto INT,
    Cantidad INT,
    Precio DECIMAL(10,2),
    FOREIGN KEY (ID_Pedido) REFERENCES Pedidos(ID_Pedido),
    FOREIGN KEY (ID_Producto) REFERENCES Productos(ID_Producto)
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
CREATE TABLE Facturas (
    ID_Factura INT PRIMARY KEY AUTO_INCREMENT,
    ID_Pedido INT NOT NULL,
    Ruta_PDF VARCHAR(255) NOT NULL,
    Fecha_Creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ID_Pedido) REFERENCES Pedidos(ID_Pedido)
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
--- Agregar al Administrador ---
INSERT INTO Usuarios (
    Nombre, 
    Apellido1, 
    Apellido2, 
    Email, 
    Password, 
    Rol, 
    Verificado
) VALUES (
    'Administrador', 
    'Gómez', 
    'Sánchez', 
    'admin@empresa.com', 
    '$2a$12$6XHCP5yNqkq6ZuOmUF6.QOr4/6B7kf1WYr/nHmFSR.oK.Ot4Es0HG', -- Hash de "Admin123!"
    'Administrador', 
    1
);

