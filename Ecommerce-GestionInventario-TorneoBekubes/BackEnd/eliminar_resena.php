<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: Content-Type");

include 'conexionBD.php';

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$response = ['success' => false];

// Verificar que se recibieron los datos necesarios
if (!$data || !isset($data['id_resena']) || !isset($data['id_usuario'])) {
    $response['message'] = "Se requiere el ID de la reseña y el ID de usuario";
    echo json_encode($response);
    exit;
}

try {
    if (!isset($conn)) {
        throw new Exception("Error de conexión a la base de datos");
    }

    // Actualizar SOLO la reseña específica del usuario (verificando que le pertenece)
    $queryActualizar = "UPDATE Reseñas SET Estado = 0 
                       WHERE ID_Reseña = :id_resena 
                       AND ID_Usuario = :id_usuario 
                       AND Estado = 1";
    
    $stmtActualizar = $conn->prepare($queryActualizar);
    $stmtActualizar->bindParam(':id_resena', $data['id_resena'], PDO::PARAM_INT);
    $stmtActualizar->bindParam(':id_usuario', $data['id_usuario'], PDO::PARAM_INT);
    
    if ($stmtActualizar->execute()) {
        $rowsAffected = $stmtActualizar->rowCount();
        
        if ($rowsAffected > 0) {
            $response['success'] = true;
            $response['message'] = "Reseña eliminada con éxito";
        } else {
            $response['message'] = "No se encontró la reseña o no tienes permiso para eliminarla";
        }
    } else {
        throw new Exception("Error al ejecutar la actualización");
    }
} catch (PDOException $e) {
    $response['message'] = "Error en la base de datos: " . $e->getMessage();
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
?>