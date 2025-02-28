<?php
require 'paypal_config.php';
include 'conexionBD.php';

// Obtener los parámetros de la URL
$paymentId = isset($_GET['paymentId']) ? $_GET['paymentId'] : null;
$payerId = isset($_GET['PayerID']) ? $_GET['PayerID'] : null;
$idPedido = isset($_GET['idPedido']) ? $_GET['idPedido'] : null;

if (!$paymentId || !$payerId || !$idPedido) {
    echo 'Faltan parámetros en la URL';
    exit;
}

// Obtener el pago de PayPal
$payment = \PayPal\Api\Payment::get($paymentId, $apiContext);
$execution = new \PayPal\Api\PaymentExecution();
$execution->setPayerId($payerId);

try {
    // Ejecutar el pago
    $payment->execute($execution, $apiContext);

    // Obtener detalles del pago
    $paymentState = $payment->getState();
    $totalAmount = $payment->getTransactions()[0]->getAmount()->getTotal();

    // Insertar el pago en la base de datos
    $status = ($paymentState == 'approved') ? 'Completado' : 'Pendiente';
    $query = "INSERT INTO Pagos (Monto_Total, Estado, ID_Pedido) VALUES (:Monto_Total, :Estado, :ID_Pedido)";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':Monto_Total', $totalAmount);
    $stmt->bindParam(':Estado', $status);
    $stmt->bindParam(':ID_Pedido', $idPedido);
    $stmt->execute();

    // Insertar el método de pago
    $paymentIdDB = $conn->lastInsertId();
    $type = 'PayPal';
    $detail = 'Pago realizado a través de PayPal';
    $query = "INSERT INTO Metodo_Pago (Tipo, Detalle, ID_Pago) VALUES (:Tipo, :Detalle, :ID_Pago)";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':Tipo', $type);
    $stmt->bindParam(':Detalle', $detail);
    $stmt->bindParam(':ID_Pago', $paymentIdDB);
    $stmt->execute();

    echo 'Pago completado correctamente';
} catch (Exception $ex) {
    echo 'Error al ejecutar el pago: ' . $ex->getMessage();
}
?>

