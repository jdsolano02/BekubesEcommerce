<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include 'conexionBD.php';

// Verificar la conexión a la base de datos
if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Error en la conexión a la base de datos"]);
    exit;
}

// Leer datos del cuerpo de la solicitud
$data = json_decode(file_get_contents("php://input"), true);

// Verificar si la solicitud es válida
if (!$data) {
    echo json_encode(["status" => "error", "message" => "Datos no válidos"]);
    exit;
}

// Obtener datos del JSON recibido
$nombre = $data['nombre'] ?? '';
$descripcion = $data['descripcion'] ?? '';
$precio = $data['precio'] ?? 0;
$stock = $data['stock'] ?? 0;
$tipo = $data['tipo'] ?? 0;
$dificultad = $data['dificultad'] ?? 0;
$imagenBase64 = $data['imagen'] ?? null;

// Validaciones
if (empty($nombre)) {
    echo json_encode(["status" => "error", "message" => "El nombre es obligatorio."]);
    exit;
}
if (empty($descripcion)) {
    echo json_encode(["status" => "error", "message" => "La descripción es obligatoria."]);
    exit;
}
if ($precio <= 0) {
    echo json_encode(["status" => "error", "message" => "El precio debe ser mayor que 0."]);
    exit;
}
if ($stock < 0) {
    echo json_encode(["status" => "error", "message" => "El stock no puede ser negativo."]);
    exit;
}

// Manejo de la imagen como BLOB
$imagenBinaria = null;
if ($imagenBase64) {
    // Decodificar la imagen base64
    $imagenBinaria = base64_decode($imagenBase64);
}

try {
    // Iniciar transacción
    $conn->beginTransaction();

    // Insertar producto en la tabla Productos
    $queryProducto = "INSERT INTO Productos (Nombre, Descripcion, Precio, Tipo, Dificultad, Imagen)
                      VALUES (:nombre, :descripcion, :precio, :tipo, :dificultad, :imagen)";

    $stmtProducto = $conn->prepare($queryProducto);
    $stmtProducto->bindParam(':nombre', $nombre);
    $stmtProducto->bindParam(':descripcion', $descripcion);
    $stmtProducto->bindParam(':precio', $precio);
    $stmtProducto->bindParam(':tipo', $tipo);
    $stmtProducto->bindParam(':dificultad', $dificultad);

    // Si hay una imagen, vincularla; de lo contrario, usar NULL
    if ($imagenBinaria) {
        $stmtProducto->bindParam(':imagen', $imagenBinaria, PDO::PARAM_LOB);
    } else {
        $stmtProducto->bindValue(':imagen', null, PDO::PARAM_NULL);
    }

    $stmtProducto->execute();

    // Obtener el ID del producto recién insertado
    $idProducto = $conn->lastInsertId();

    // Insertar stock en la tabla Inventario
    $queryInventario = "INSERT INTO Inventario (ID_Producto, Cantidad_Disponible)
                        VALUES (:idProducto, :stock)";
    $stmtInventario = $conn->prepare($queryInventario);
    $stmtInventario->bindParam(':idProducto', $idProducto);
    $stmtInventario->bindParam(':stock', $stock);
    $stmtInventario->execute();

    // Confirmar transacción
    $conn->commit();

    echo json_encode(["status" => "success", "message" => "Producto agregado correctamente."]);
} catch (PDOException $e) {
    // Revertir en caso de error
    $conn->rollBack();
    echo json_encode(["status" => "error", "message" => "Error en la base de datos: " . $e->getMessage()]);
}

?>
