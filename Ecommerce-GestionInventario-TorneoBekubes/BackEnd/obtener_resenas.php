<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

// Verifica que el archivo de conexión exista
if (!file_exists('conexionBD.php')) {
    echo json_encode(['success' => false, 'message' => 'Archivo de conexión no encontrado']);
    exit;
}

include 'conexionBD.php';

$response = ['success' => false, 'reseñas' => []];

try {
    // Verifica que la conexión esté establecida (usando $conn en lugar de $pdo)
    if (!isset($conn)) {
        throw new Exception("Error de conexión a la base de datos");
    }

    $query = "SELECT r.*, u.Nombre, u.Apellido1, u.Apellido2 
              FROM Reseñas r
              JOIN Usuarios u ON r.ID_Usuario = u.ID_Usuario
              WHERE r.Estado = 1
              ORDER BY r.Fecha DESC";
    
    $stmt = $conn->prepare($query); // Cambiado de $pdo a $conn
    $stmt->execute();
    
    $reseñas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $response['success'] = true;
    $response['reseñas'] = $reseñas;
} catch (PDOException $e) {
    $response['message'] = "Error en la base de datos: " . $e->getMessage();
    // Para depuración durante desarrollo:
    $response['error_details'] = [
        'code' => $e->getCode(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ];
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response, JSON_UNESCAPED_UNICODE); // Para mantener caracteres especiales
?>