<?php
// Permitir solicitudes CORS desde cualquier origen (o desde tu dominio específico)
header("Access-Control-Allow-Origin: *"); // O reemplázalo por 'http://localhost:3000' para restringirlo solo a tu frontend.
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Verificar si la solicitud es OPTIONS (pre-flight request)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    // Respondemos a las solicitudes OPTIONS (pre-flight)
    http_response_code(200);
    exit();
}

require 'paypal_config.php';
include 'conexionBD.php';

// Obtener los datos del pago enviados desde React
$inputData = json_decode(file_get_contents("php://input"), true);

// Verificar que los datos estén presentes
if (isset($inputData['transactionId'], $inputData['payerName'], $inputData['amount'])) {
    $transactionId = $inputData['transactionId'];
    $payerName = $inputData['payerName'];
    $amount = $inputData['amount'];
    $idPedido = $_GET['idPedido']; // Obtener el ID del pedido desde los parámetros GET

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
        echo json_encode(['error' => 'Hubo un error al procesar el pago']);
    }
} else {
    echo json_encode(['error' => 'Faltan datos en la solicitud']);
}
?>


