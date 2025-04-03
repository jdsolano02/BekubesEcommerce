<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
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

// Verificación completa de datos recibidos
if (!$data || !isset($data['comentario']) || !isset($data['valoracion']) || !isset($data['id_usuario'])) {
    $response['message'] = "Datos incompletos o formato incorrecto";
    echo json_encode($response);
    exit;
}

try {
    // Verificar que la conexión esté establecida (usamos $conn en lugar de $pdo)
    if (!isset($conn)) {
        throw new Exception("Error de conexión a la base de datos");
    }

    $query = "INSERT INTO Reseñas (ID_Producto, Comentario, Valoracion, Fecha, ID_Usuario, Estado, likes) 
              VALUES (NULL, :comentario, :valoracion, NOW(), :id_usuario, 1, 0)";
    
    $stmt = $conn->prepare($query); // Cambiado de $pdo a $conn
    $stmt->bindParam(':comentario', $data['comentario'], PDO::PARAM_STR);
    $stmt->bindParam(':valoracion', $data['valoracion'], PDO::PARAM_INT);
    $stmt->bindParam(':id_usuario', $data['id_usuario'], PDO::PARAM_INT);
    
    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = "Reseña guardada con éxito";
        $response['id_reseña'] = $conn->lastInsertId(); // Cambiado de $pdo a $conn
    } else {
        $response['message'] = "Error al ejecutar la consulta";
    }
} catch (PDOException $e) {
    $response['message'] = "Error en la base de datos: " . $e->getMessage();
    // Para depuración durante desarrollo:
    $response['error_details'] = [
        'code' => $e->getCode(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTrace() // Agregado para más detalles de depuración
    ];
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
?>