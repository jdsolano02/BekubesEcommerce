<?php
// Incluir archivo de conexión
include 'conexionBD.php';

// Configurar cabeceras para API REST
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Solo permitir método GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'status' => 'method_not_allowed',
        'message' => 'Solo se permite el método GET'
    ]);
    exit;
}

// Obtener participantes confirmados de un torneo
if (!isset($_GET['torneo_id'])) {
    http_response_code(400);
    echo json_encode([
        'status' => 'bad_request',
        'message' => 'Falta el parámetro torneo_id'
    ]);
    exit;
}

$torneo_id = $_GET['torneo_id'];

try {
    $query = "SELECT 
                u.ID_Usuario AS ID_Participante,
                u.Nombre AS Nombre,
                u.Apellido1 AS Apellido,
                u.Email AS Email,
                i.fecha_inscripcion AS Fecha_Inscripcion
              FROM inscripciones i
              JOIN usuarios u ON i.usuario_id = u.ID_Usuario
              WHERE i.torneo_id = :torneo_id AND i.estado = 'confirmada'
              ORDER BY u.Apellido1, u.Nombre";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':torneo_id', $torneo_id, PDO::PARAM_INT);
    $stmt->execute();
    
    $participantes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if ($participantes) {
        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'data' => $participantes
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            'status' => 'not_found',
            'message' => 'No se encontraron participantes confirmados para este torneo.'
        ]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error en la base de datos: ' . $e->getMessage()
    ]);
}
?>