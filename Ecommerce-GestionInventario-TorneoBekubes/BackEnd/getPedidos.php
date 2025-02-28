<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json"); // Asegúrate de que el contenido sea JSON

include 'conexionBD.php';

// Obtener el idPedido de los parámetros GET
if (isset($_GET['idPedido'])) {
    $idPedido = $_GET['idPedido'];
} else {
    // Si no se proporciona el idPedido, devolver un error en JSON
    echo json_encode(array('error' => 'El id del pedido no fue proporcionado'));
    exit;
}

// Consulta para obtener los detalles del pedido (productos) y sumar los precios
$query = "
    SELECT SUM(pd.precio * pd.cantidad) AS Total
    FROM pedidodetalles pd
    WHERE pd.id_pedido = :idPedido
";

// Preparar la consulta
$stmt = $conn->prepare($query);

// Vincular el parámetro
$stmt->bindParam(':idPedido', $idPedido);

// Ejecutar la consulta
$stmt->execute();

// Obtener el resultado
$result = $stmt->fetch(PDO::FETCH_ASSOC);

// Verificar si se encontró el total
if ($result && isset($result['Total'])) {
    // Enviar el total como respuesta JSON
    echo json_encode(array('total' => $result['Total']));
} else {
    // Si no se encuentra el pedido o hay algún error
    echo json_encode(array('error' => 'No se encontró el total del pedido.'));
}
?>