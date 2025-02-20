<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include 'conexionBD.php';

// Leer y decodificar la solicitud JSON
$data = json_decode(file_get_contents("php://input"), true);

// Validar si los datos existen
if (!isset($data['idUsuario']) || !isset($data['items']) || !is_array($data['items'])) {
    echo json_encode(["status" => "error", "message" => "Datos incompletos o formato incorrecto"]);
    exit;
}

$idUsuario = intval($data['idUsuario']);
$items = $data['items'];

if ($idUsuario <= 0) {
    echo json_encode(["status" => "error", "message" => "ID_Usuario inválido"]);
    exit;
}

// Calcular el total del carrito
$total = 0;
foreach ($items as $item) {
    if (!isset($item['precio'], $item['cantidad'], $item['idProducto'])) {
        echo json_encode(["status" => "error", "message" => "Faltan datos en los items"]);
        exit;
    }
    $total += $item['precio'] * $item['cantidad'];
}

try {
    $conn->beginTransaction();

    // Insertar el carrito
    $queryCarrito = "INSERT INTO Carrito (Total, ID_Usuario) VALUES (:total, :idUsuario)";
    $stmtCarrito = $conn->prepare($queryCarrito);
    $stmtCarrito->bindParam(':total', $total);
    $stmtCarrito->bindParam(':idUsuario', $idUsuario);
    $stmtCarrito->execute();

    $idCarrito = $conn->lastInsertId();

    // Insertar los items del carrito
    $queryItem = "INSERT INTO Items_Carrito (ID_Carrito, ID_Producto, Cantidad, Subtotal) VALUES (:idCarrito, :idProducto, :cantidad, :subtotal)";
    $stmtItem = $conn->prepare($queryItem);

    foreach ($items as $item) {
        $subtotal = $item['precio'] * $item['cantidad'];
        $stmtItem->bindParam(':idCarrito', $idCarrito);
        $stmtItem->bindParam(':idProducto', $item['idProducto']);
        $stmtItem->bindParam(':cantidad', $item['cantidad']);
        $stmtItem->bindParam(':subtotal', $subtotal);
        $stmtItem->execute();
    }

    $conn->commit();
    echo json_encode(["status" => "success", "message" => "Carrito guardado correctamente."]);
} catch (PDOException $e) {
    $conn->rollBack();
    echo json_encode(["status" => "error", "message" => "Error al guardar el carrito: " . $e->getMessage()]);
}
?>
