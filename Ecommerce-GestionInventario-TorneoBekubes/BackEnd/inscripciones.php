<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'conexionBD.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

function validarId($id) {
    return isset($id) && is_numeric($id) && $id > 0;
}

switch ($method) {
    case 'GET':
        // Obtener inscripciones por usuario
        if (isset($_GET['usuario_id'])) {
            $usuario_id = $_GET['usuario_id'];
            
            if (!validarId($usuario_id)) {
                http_response_code(400);
                echo json_encode(['error' => 'ID de usuario no válido']);
                exit();
            }

            $stmt = $conn->prepare("
                SELECT i.*, t.Nombre as torneo_nombre, t.Fecha, t.Ubicacion 
                FROM Inscripciones i
                JOIN Torneos t ON i.torneo_id = t.ID_Torneo
                WHERE i.usuario_id = ?
            ");
            $stmt->execute([$usuario_id]);
            $inscripciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode($inscripciones);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Se requiere usuario_id']);
        }
        break;

    case 'POST':
        // Crear nueva inscripción (confirmada por defecto)
        if (!validarId($input['usuario_id']) || !validarId($input['torneo_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'IDs de usuario o torneo no válidos']);
            exit();
        }

        $usuario_id = $input['usuario_id'];
        $torneo_id = $input['torneo_id'];

        try {
            // Verificar si el torneo existe
            $stmt = $conn->prepare("SELECT ID_Torneo FROM Torneos WHERE ID_Torneo = ?");
            $stmt->execute([$torneo_id]);
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'El torneo no existe']);
                exit();
            }

            // Verificar si ya está inscrito
            $stmt = $conn->prepare("SELECT * FROM Inscripciones WHERE usuario_id = ? AND torneo_id = ?");
            $stmt->execute([$usuario_id, $torneo_id]);
            
            if ($stmt->rowCount() > 0) {
                http_response_code(409);
                echo json_encode(['error' => 'Ya estás inscrito en este torneo']);
                exit();
            }
            
            // Crear la inscripción con estado "confirmada"
            $stmt = $conn->prepare("
                INSERT INTO Inscripciones 
                (usuario_id, torneo_id, fecha_inscripcion, estado) 
                VALUES (?, ?, ?, 'confirmada')
            ");
            
            $fecha = date('Y-m-d');
            
            if ($stmt->execute([$usuario_id, $torneo_id, $fecha])) {
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Inscripción confirmada exitosamente',
                    'inscripcion_id' => $conn->lastInsertId()
                ]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error en la base de datos: ' . $e->getMessage()]);
        }
        break;

    case 'PUT':
        // Cancelar inscripción (cambiar estado a "cancelada")
        if (!validarId($input['inscripcion_id']) || !validarId($input['usuario_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'IDs no válidos']);
            exit();
        }

        try {
            // Verificar que la inscripción pertenece al usuario
            $stmt = $conn->prepare("
                UPDATE Inscripciones 
                SET estado = 'cancelada' 
                WHERE ID_Inscripcion = ? AND usuario_id = ?
            ");
            
            if ($stmt->execute([$input['inscripcion_id'], $input['usuario_id']])) {
                if ($stmt->rowCount() > 0) {
                    echo json_encode(['success' => true, 'message' => 'Inscripción cancelada']);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Inscripción no encontrada o no pertenece al usuario']);
                }
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al cancelar inscripción: ' . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
        break;
}
?>