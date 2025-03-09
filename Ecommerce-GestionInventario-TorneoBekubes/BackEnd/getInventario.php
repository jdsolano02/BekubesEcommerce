<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json"); 

include 'conexionBD.php';

try {
    // Consulta para obtener el inventario con información del producto
    $query = "
        SELECT 
            i.ID_Inventario,
            p.ID_Producto,
            p.Nombre AS Producto,
            i.Cantidad_Disponible AS Stock,
            IFNULL(i.Cantidad_Minima, 0) AS Stock_Minimo,
            i.FechaCreacion,
            i.FechaModificacion
        FROM 
            Inventario i
        JOIN 
            Productos p ON i.ID_Producto = p.ID_Producto
    ";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $inventario = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "data" => $inventario]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error al obtener el inventario: " . $e->getMessage()]);
}
?>

