<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Habilitar la visualización de errores
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Conexión con la base de datos
include 'conexionBD.php';

try {
    // Obtener el ID_Pedido desde la solicitud GET
    if (!isset($_GET['idPedido'])) {
        throw new Exception("Falta el parámetro idPedido");
    }

    $idPedido = $_GET['idPedido'];

    // Obtener la factura correspondiente al ID_Pedido
    $query = "SELECT * FROM Facturas WHERE ID_Pedido = :ID_Pedido";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':ID_Pedido', $idPedido);
    $stmt->execute();

    $factura = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($factura) {
        // Devolver la factura en formato JSON
        echo json_encode(['success' => true, 'factura' => $factura]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No se encontró la factura']);
    }
} catch (PDOException $e) {
    // Error de base de datos
    echo json_encode(['error' => 'Error en la base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    // Error general
    echo json_encode(['error' => $e->getMessage()]);
}
?>