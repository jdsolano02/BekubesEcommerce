<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT"); // Cambiado a PUT
header("Access-Control-Allow-Headers: Content-Type");

// Verifica que el archivo de conexión exista
if (!file_exists('conexionBD.php')) {
    echo json_encode(['success' => false, 'message' => 'Archivo de conexión no encontrado']);
    exit;
}

include 'conexionBD.php';

// Obtener el contenido JSON del cuerpo de la solicitud
$json = file_get_contents('php://input');
$data = json_decode($json, true);

$response = ['success' => false];

// Verificar que se recibió el ID de usuario
if (!$data || !isset($data['id_usuario'])) {
    $response['message'] = "Se requiere el ID de usuario";
    echo json_encode($response);
    exit;
}

try {
    // Verificar que la conexión esté establecida
    if (!isset($conn)) {
        throw new Exception("Error de conexión a la base de datos");
    }

    // Actualizar TODAS las reseñas del usuario (borrado lógico)
    $queryActualizar = "UPDATE Reseñas SET Estado = 0 WHERE ID_Usuario = :id_usuario AND Estado = 1";
    $stmtActualizar = $conn->prepare($queryActualizar);
    $stmtActualizar->bindParam(':id_usuario', $data['id_usuario'], PDO::PARAM_INT);
    
    if ($stmtActualizar->execute()) {
        $rowsAffected = $stmtActualizar->rowCount();
        
        if ($rowsAffected > 0) {
            $response['success'] = true;
            $response['message'] = "Reseñas actualizadas con éxito";
            $response['resenas_actualizadas'] = $rowsAffected;
        } else {
            $response['message'] = "No se encontraron reseñas activas para este usuario";
        }
    } else {
        throw new Exception("Error al ejecutar la actualización");
    }
} catch (PDOException $e) {
    $response['message'] = "Error en la base de datos: " . $e->getMessage();
    $response['error_details'] = [
        'code' => $e->getCode(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ];
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
?>