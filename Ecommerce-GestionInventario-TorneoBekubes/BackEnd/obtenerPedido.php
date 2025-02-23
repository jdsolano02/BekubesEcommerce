<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

include 'conexionBD.php';

try {
    // Verificar si se proporcionó un filtro por estado (para el admin)
    $filtroEstado = isset($_GET['estado']) ? $_GET['estado'] : null;

    // Consulta para obtener todos los pedidos con sus detalles
    $query = "
        SELECT 
            p.ID_Pedido, 
            p.Estado, 
            p.Fecha, 
            p.Email,
            pd.ID_Producto, 
            pd.Cantidad, 
            pd.Precio, 
            pr.Nombre AS Producto
        FROM 
            Pedidos p
        JOIN 
            PedidoDetalles pd ON p.ID_Pedido = pd.ID_Pedido
        JOIN 
            Productos pr ON pd.ID_Producto = pr.ID_Producto
        WHERE 
            (:estado IS NULL OR p.Estado = :estado)
    ";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':estado', $filtroEstado);
    $stmt->execute();
    $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Devolver los pedidos en formato JSON
    echo json_encode(["status" => "success", "pedidos" => $pedidos]);
} catch (PDOException $e) {
    // Manejar errores de la base de datos
    echo json_encode(["status" => "error", "message" => "Error en la base de datos: " . $e->getMessage()]);
}
?>