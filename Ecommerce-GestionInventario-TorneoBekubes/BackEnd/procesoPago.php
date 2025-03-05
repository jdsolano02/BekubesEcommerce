<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Conexión con la base de datos
include 'conexionBD.php';

try {
    // Obtener los datos del pago enviados desde el frontend (React)
    $inputData = json_decode(file_get_contents("php://input"), true);

    // Verificar que los datos estén presentes
    if (!isset($inputData['transactionId'], $inputData['payerName'], $inputData['amount'], $inputData['idPedido'])) {
        throw new Exception("Faltan datos en la solicitud");
    }

    $transactionId = $inputData['transactionId'];
    $payerName = $inputData['payerName'];
    $amount = $inputData['amount'];
    $idPedido = $inputData['idPedido'];

    // Registrar el pago en la tabla Pagos
    $query = "INSERT INTO Pagos (Monto_Total, Estado, ID_Pedido) VALUES (:Monto_Total, :Estado, :ID_Pedido)";
    $stmt = $conn->prepare($query);

    // Usar variables explícitas para bindParam
    $estado = 'Completado'; // Variable para el estado
    $stmt->bindParam(':Monto_Total', $amount);
    $stmt->bindParam(':Estado', $estado); // Ahora es una variable
    $stmt->bindParam(':ID_Pedido', $idPedido);
    $stmt->execute();

    // Obtener el ID del pago registrado
    $idPago = $conn->lastInsertId();

    // Registrar el método de pago (PayPal)
    $queryMetodo = "INSERT INTO Metodo_Pago (Tipo, Detalle, ID_Pago) VALUES (:Tipo, :Detalle, :ID_Pago)";
    $stmtMetodo = $conn->prepare($queryMetodo);

    // Usar variables explícitas para bindParam
    $tipo = 'PayPal'; // Variable para el tipo de pago
    $detalle = 'Transaction ID: ' . $transactionId . ', Payer: ' . $payerName; // Variable para el detalle
    $stmtMetodo->bindParam(':Tipo', $tipo); // Ahora es una variable
    $stmtMetodo->bindParam(':Detalle', $detalle); // Ahora es una variable
    $stmtMetodo->bindParam(':ID_Pago', $idPago);
    $stmtMetodo->execute();

    // Actualizar el estado del pedido a "Enviado"
    $queryUpdatePedido = "UPDATE Pedidos SET Estado = 'Enviado' WHERE ID_Pedido = :ID_Pedido";
    $stmtUpdatePedido = $conn->prepare($queryUpdatePedido);
    $stmtUpdatePedido->bindParam(':ID_Pedido', $idPedido);
    $stmtUpdatePedido->execute();

    // Responder con éxito
    echo json_encode(['success' => true, 'message' => 'Pago registrado y pedido actualizado a "Enviado".']);
} catch (PDOException $e) {
    // Error de base de datos
    echo json_encode(['error' => 'Error en la base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    // Error general
    echo json_encode(['error' => $e->getMessage()]);
}
?>