<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

include 'conexionBD.php';

$idUsuario = $_GET['idUsuario']; // Obtener el idUsuario desde la URL

try {
    // Consulta SQL para obtener los pedidos del usuario y el total de cada pedido
    $query = "
        SELECT 
            p.ID_Pedido, 
            p.Estado, 
            p.Fecha, 
            SUM(pd.Cantidad * pd.Precio) AS Total
        FROM 
            Pedidos p
        INNER JOIN 
            PedidoDetalles pd ON p.ID_Pedido = pd.ID_Pedido
        WHERE 
            p.ID_Usuario = :idUsuario
        GROUP BY 
            p.ID_Pedido
    ";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':idUsuario', $idUsuario);
    $stmt->execute();
    $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "pedidos" => $pedidos,
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Error al obtener los pedidos: " . $e->getMessage(),
    ]);
}
?>