<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json"); 
include 'conexionBD.php'; // Asegúrate de que este archivo contiene tu conexión a la base de datos

try {
    // Verificar si se proporcionó el idPedido
    if (!isset($_GET['idPedido']) || empty($_GET['idPedido'])) {
        throw new Exception('El parámetro idPedido es requerido');
    }

    $idPedido = $_GET['idPedido'];

    // Preparar la consulta SQL con JOIN para obtener los nombres de los productos
    $sql = "SELECT pd.ID_Detalle, pd.ID_Pedido, pd.ID_Producto, p.Nombre AS NombreProducto, 
                   pd.Cantidad, pd.Precio
            FROM PedidoDetalles pd
            INNER JOIN Productos p ON pd.ID_Producto = p.ID_Producto
            WHERE pd.ID_Pedido = :idPedido";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':idPedido', $idPedido, PDO::PARAM_INT);
    $stmt->execute();

    $detalles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($detalles)) {
        echo json_encode(['success' => false, 'message' => 'No se encontraron detalles para este pedido']);
        exit;
    }

    // Devolver los detalles en formato JSON
    echo json_encode(['success' => true, 'data' => $detalles]);

} catch (Exception $e) {
    // Manejar errores
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>