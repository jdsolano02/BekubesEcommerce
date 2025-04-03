<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Manejar preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/conexionBD.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        $stmt = $conn->query("SELECT * FROM Torneos WHERE Estado = 1");
        $torneos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($torneos);
        break;

    case 'POST':
        if (!empty($input['Nombre']) && !empty($input['Fecha']) && !empty($input['Ubicacion']) && !empty($input['Categoria'])) {
            $stmt = $conn->prepare("INSERT INTO Torneos (Nombre, Fecha, Ubicacion, Categoria) VALUES (?, ?, ?, ?)");
            if ($stmt->execute([$input['Nombre'], $input['Fecha'], $input['Ubicacion'], $input['Categoria']])) {
                http_response_code(201);
                echo json_encode(['message' => 'Torneo creado exitosamente']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['message' => 'Datos incompletos']);
        }
        break;

    case 'PUT':
        if (!empty($input['ID_Torneo'])) {
            $stmt = $conn->prepare("UPDATE Torneos SET Nombre = ?, Fecha = ?, Ubicacion = ?, Categoria = ? WHERE ID_Torneo = ?");
            if ($stmt->execute([$input['Nombre'], $input['Fecha'], $input['Ubicacion'], $input['Categoria'], $input['ID_Torneo']])) {
                http_response_code(200);
                echo json_encode(['message' => 'Torneo actualizado exitosamente']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['message' => 'ID de torneo requerido']);
        }
        break;

        case 'DELETE':
            // Obtener ID de la URL
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                http_response_code(400);
                echo json_encode(['message' => 'ID de torneo requerido']);
                exit();
            }
            
            // Convertir a entero por seguridad
            $id = intval($id);
            
            try {
                // Actualizar estado a 0 (eliminado lógico) en lugar de borrar
                $stmt = $conn->prepare("UPDATE Torneos SET Estado = 0 WHERE ID_Torneo = ?");
                
                if ($stmt->execute([$id])) {
                    if ($stmt->rowCount() > 0) {
                        echo json_encode([
                            'status' => 'success',
                            'message' => 'Torneo marcado como eliminado exitosamente'
                        ]);
                    } else {
                        http_response_code(404);
                        echo json_encode([
                            'status' => 'not_found',
                            'message' => 'No se encontró el torneo con ese ID o ya estaba eliminado'
                        ]);
                    }
                } else {
                    http_response_code(500);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Error al marcar el torneo como eliminado'
                    ]);
                }
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Error en la base de datos: ' . $e->getMessage()
                ]);
            }
            break;
}
?>