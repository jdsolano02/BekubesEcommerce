<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

include 'conexionBD.php'; 

try {
    $query = "
        SELECT 
            p.ID_Producto, 
            p.Nombre, 
            p.Descripcion, 
            p.Precio, 
            p.Imagen, 
            p.Estado,
            p.Tipo,
            p.Dificultad,
            i.Cantidad_Disponible AS Stock 
        FROM 
            Productos p 
        LEFT JOIN 
            Inventario i 
        ON 
            p.ID_Producto = i.ID_Producto
    ";
    $stmt = $conn->prepare($query);
    $stmt->execute();

    // Obtener los resultados
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Convertir la imagen a Base64
    foreach ($productos as &$producto) {
        if (!empty($producto['Imagen'])) {
            $producto['Imagen'] = base64_encode($producto['Imagen']);
        }
    }

    // Devolver los productos en formato JSON
    echo json_encode(["status" => "success", "data" => $productos]);
} catch (PDOException $e) {
    // Manejar errores de la base de datos
    echo json_encode(["status" => "error", "message" => "Error al obtener los productos: " . $e->getMessage()]);
}
?>
