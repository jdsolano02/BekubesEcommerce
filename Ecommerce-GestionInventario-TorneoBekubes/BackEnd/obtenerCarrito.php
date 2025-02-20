<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

include 'conexionBD.php';

// Verifica si el parámetro idUsuario está presente en la URL
if (!isset($_GET['idUsuario'])) {
    echo json_encode(["status" => "error", "message" => "El parámetro idUsuario es requerido."]);
    exit;
}

$idUsuario = $_GET['idUsuario'];

try {
    // Obtener el carrito del usuario
    $queryCarrito = "SELECT * FROM Carrito WHERE ID_Usuario = :idUsuario ORDER BY ID_Carrito DESC LIMIT 1";
    $stmtCarrito = $conn->prepare($queryCarrito);
    $stmtCarrito->bindParam(':idUsuario', $idUsuario);
    $stmtCarrito->execute();
    $carrito = $stmtCarrito->fetch(PDO::FETCH_ASSOC);

    if ($carrito) {
        // Obtener los items del carrito con información del producto
        $queryItems = "SELECT ic.*, p.Nombre, p.Precio 
                       FROM Items_Carrito ic 
                       JOIN Productos p ON ic.ID_Producto = p.ID_Producto
                       WHERE ic.ID_Carrito = :idCarrito";
        $stmtItems = $conn->prepare($queryItems);
        $stmtItems->bindParam(':idCarrito', $carrito['ID_Carrito']);
        $stmtItems->execute();
        $items = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "status" => "success",
            "carrito" => $carrito,
            "items" => $items,
        ]);
    } else {
        // Si no hay carrito, devolver un array vacío para items
        echo json_encode([
            "status" => "success",
            "carrito" => null,
            "items" => [],
        ]);
    }
} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Error al obtener el carrito: " . $e->getMessage(),
    ]);
}
?>