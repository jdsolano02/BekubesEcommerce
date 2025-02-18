<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, POST");
header("Access-Control-Allow-Headers: Content-Type");

include 'conexionBD.php';

// Obtener los datos del formulario
$data = json_decode(file_get_contents("php://input"), true);

// Comentar o eliminar el var_dump para evitar que se incluya en la respuesta
// var_dump($data); // Verificar los datos recibidos (solo para depuración)

$id = $data['id'] ?? 0;
$nombre = $data['nombre'] ?? '';
$descripcion = $data['descripcion'] ?? '';
$precio = $data['precio'] ?? 0;
$stock = $data['stock'] ?? 0;
$tipo = $data['tipo'] ?? '';
$dificultad = $data['dificultad'] ?? '';
$imagenBase64 = $data['imagen'] ?? '';

// Validar los datos
if ($id <= 0) {
    echo json_encode(["status" => "error", "message" => "El ID del producto es inválido."]);
    exit;
}
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

// Verificar si la imagen es válida en base64
$imagenBinaria = null;
if (!empty($imagenBase64)) {
    $imageData = base64_decode($imagenBase64, true);
    if ($imageData === false) {
        echo json_encode(["status" => "error", "message" => "La imagen en base64 no es válida."]);
        exit;
    }
    $imagenBinaria = $imageData;
}

try {
    // Iniciar una transacción
    $conn->beginTransaction();

    // Preparar la consulta de actualización
    $queryProducto = "UPDATE Productos 
    SET Nombre = :nombre, Descripcion = :descripcion, Precio = :precio, Tipo = :tipo, Dificultad = :dificultad";

    // Si se proporciona una imagen, incluirla en la actualización
    if (!empty($imagenBase64)) {
        $queryProducto .= ", Imagen = :imagen";
    }

    $queryProducto .= " WHERE ID_Producto = :id";

    $stmtProducto = $conn->prepare($queryProducto);
    $stmtProducto->bindParam(':nombre', $nombre);
    $stmtProducto->bindParam(':descripcion', $descripcion);
    $stmtProducto->bindParam(':precio', $precio);
    $stmtProducto->bindParam(':tipo', $tipo);
    $stmtProducto->bindParam(':dificultad', $dificultad);
    $stmtProducto->bindParam(':id', $id);

    // Si la imagen no está vacía, la vinculamos
    if (!empty($imagenBase64)) {
        $stmtProducto->bindParam(':imagen', $imagenBinaria, PDO::PARAM_LOB);
    }

    $stmtProducto->execute();

    // Confirmar la transacción
    $conn->commit();

    echo json_encode(["status" => "success", "message" => "Producto actualizado correctamente."]);
} catch (PDOException $e) {
    // Revertir la transacción en caso de error
    $conn->rollBack();
    echo json_encode(["status" => "error", "message" => "Error en la base de datos: " . $e->getMessage()]);
}
?>