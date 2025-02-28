<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Conexión con la base de datos
include 'conexionBD.php';

// Obtener los datos del pago enviados desde el frontend (React)
$inputData = json_decode(file_get_contents("php://input"), true);

// Verificar que los datos estén presentes
if (isset($inputData['transactionId'], $inputData['payerName'], $inputData['amount'], $inputData['idPedido'])) {
    $transactionId = $inputData['transactionId'];
    $payerName = $inputData['payerName'];
    $amount = $inputData['amount'];
    $idPedido = $inputData['idPedido'];

    // Registrar el pago en la base de datos
    try {
        // Registrar el pago en la tabla Pagos
        $query = "INSERT INTO Pagos (Monto_Total, Estado, ID_Pedido) VALUES (:Monto_Total, :Estado, :ID_Pedido)";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':Monto_Total', $amount);
        $stmt->bindParam(':Estado', $estado = 'Completado'); // Pago completado
        $stmt->bindParam(':ID_Pedido', $idPedido);
        $stmt->execute();

        // Obtener el ID del pago registrado
        $idPago = $conn->lastInsertId();

        // Registrar el método de pago (PayPal)
        $queryMetodo = "INSERT INTO Metodo_Pago (Tipo, Detalle, ID_Pago) VALUES (:Tipo, :Detalle, :ID_Pago)";
        $stmtMetodo = $conn->prepare($queryMetodo);
        $stmtMetodo->bindParam(':Tipo', $tipo = 'PayPal');
        $stmtMetodo->bindParam(':Detalle', $detalle = 'Transaction ID: ' . $transactionId);
        $stmtMetodo->bindParam(':ID_Pago', $idPago);
        $stmtMetodo->execute();

        // Responder con éxito
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        // En caso de error, devolver un JSON con el mensaje de error
        echo json_encode(['error' => 'Hubo un error al procesar el pago: ' . $e->getMessage()]);
    }
} else {
    // Si faltan datos, devolver un JSON con el mensaje de error
    echo json_encode(['error' => 'Faltan datos en la solicitud']);
}
?>
