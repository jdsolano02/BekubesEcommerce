<?php
// Limpiar cualquier buffer existente
while (ob_get_level()) ob_end_clean();

// Iniciar nuevo buffer
ob_start();

// Headers deben ser lo primero
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Deshabilitar visualización de errores (registrarlos solo en logs)
ini_set('display_errors', 0);
error_reporting(E_ALL);
ini_set('error_log', 'php_errors.log');

include 'conexionBD.php';
require '../PHPMailer-master/src/PHPMailer.php';
require '../PHPMailer-master/src/SMTP.php';
require '../PHPMailer-master/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

// Función para enviar correo (modificada para evitar salidas)
function enviarCorreoNuevoProducto($conn, $nombreProducto, $descripcion) {
    $query = "SELECT email FROM usuarios WHERE Verificado = 1 AND rol = 'cliente'";;
    $stmt = $conn->query($query);
    $destinatarios = $stmt->fetchAll(PDO::FETCH_COLUMN);

    if (empty($destinatarios)) {
        error_log("No hay destinatarios para enviar el correo");
        return false;
    }

    $mail = new PHPMailer(true);
    
    try {
        // Deshabilitar salida de debug (o redirigir a logs)
        $mail->SMTPDebug = 0; // Cambiado de DEBUG_SERVER a 0 (sin salida)
        $mail->Debugoutput = function($str, $level) {
            error_log("PHPMailer: $str");
        };
        
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'crissnchz983@gmail.com';
        $mail->Password = 'odmy iqen gjkp dzjg';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        $mail->setFrom('notificaciones@Bekubes.com', 'Sistema de Inventario');
        
        foreach ($destinatarios as $email) {
            $mail->addAddress($email);
        }

        $mail->isHTML(true);
        $mail->Subject = 'Nuevo producto agregado al inventario';
        $mail->Body = " <h1>Nuevo producto disponible</h1>
            <p>Se ha agregado un nuevo producto al inventario:</p>
            <p><strong>Nombre:</strong> {$nombreProducto}</p>
            <p><strong>Descripción:</strong> {$descripcion}</p>
            <p>¡Visita nuestro sistema para más detalles!</p>"; 
        
        return $mail->send();
    } catch (Exception $e) {
        error_log("Excepción al enviar correo: " . $e->getMessage());
        return false;
    }
}

// Verificar la conexión a la base de datos
if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Error en la conexión a la base de datos"]);
    exit;
}

// Leer datos del cuerpo de la solicitud
$data = json_decode(file_get_contents("php://input"), true);

// Verificar si la solicitud es válida
if (!$data) {
    echo json_encode(["status" => "error", "message" => "Datos no válidos"]);
    exit;
}

// Obtener datos del JSON recibido
$nombre = $data['nombre'] ?? '';
$descripcion = $data['descripcion'] ?? '';
$precio = $data['precio'] ?? 0;
$stock = $data['stock'] ?? 0;
$tipo = $data['tipo'] ?? 0;
$dificultad = $data['dificultad'] ?? 0;
$imagenBase64 = $data['imagen'] ?? null;

// Validaciones
if (empty($nombre)) {
    echo json_encode(["status" => "error", "message" => "El nombre es obligatorio."]);
    exit;
}
if (empty($descripcion)) {
    echo json_encode(["status" => "error", "message" => "La descripción es obligatoria."]);
    exit;
}
if ($precio <= 0) {
    echo json_encode(["status" => "error", "message" => "El precio debe ser mayor que 0."]);
    exit;
}
if ($stock < 0) {
    echo json_encode(["status" => "error", "message" => "El stock no puede ser negativo."]);
    exit;
}

// Manejo de la imagen como BLOB
$imagenBinaria = null;
if ($imagenBase64) {
    $imagenBinaria = base64_decode($imagenBase64);
}

try {
    // Iniciar transacción
    $conn->beginTransaction();

    // Insertar producto en la tabla Productos
    $queryProducto = "INSERT INTO Productos (Nombre, Descripcion, Precio, Tipo, Dificultad, Imagen)
                      VALUES (:nombre, :descripcion, :precio, :tipo, :dificultad, :imagen)";

    $stmtProducto = $conn->prepare($queryProducto);
    $stmtProducto->bindParam(':nombre', $nombre);
    $stmtProducto->bindParam(':descripcion', $descripcion);
    $stmtProducto->bindParam(':precio', $precio);
    $stmtProducto->bindParam(':tipo', $tipo);
    $stmtProducto->bindParam(':dificultad', $dificultad);

    if ($imagenBinaria) {
        $stmtProducto->bindParam(':imagen', $imagenBinaria, PDO::PARAM_LOB);
    } else {
        $stmtProducto->bindValue(':imagen', null, PDO::PARAM_NULL);
    }

    $stmtProducto->execute();

    // Obtener el ID del producto recién insertado
    $idProducto = $conn->lastInsertId();

    //Declarar la Cantidad Minima
    $cantidadMinima = 15;

    // Insertar stock en la tabla Inventario
    $queryInventario = "INSERT INTO Inventario (ID_Producto, Cantidad_Disponible, Cantidad_Minima)
                        VALUES (:idProducto, :stock, :cantidadMinima)";
    $stmtInventario = $conn->prepare($queryInventario);
    $stmtInventario->bindParam(':idProducto', $idProducto);
    $stmtInventario->bindParam(':stock', $stock);
    $stmtInventario->bindParam(':cantidadMinima', $cantidadMinima);
    $stmtInventario->execute();

    // Confirmar transacción
    $conn->commit();

    // LLAMAR A LA FUNCIÓN PARA ENVIAR CORREO (AÑADIDO)
    // Enviar correo (sin afectar salida)
    $envioCorreo = enviarCorreoNuevoProducto($conn, $nombre, $descripcion);
    
    // Preparar respuesta
    $response = $envioCorreo 
        ? ["status" => "success", "message" => "Producto agregado y notificación enviada"]
        : ["status" => "success", "message" => "Producto agregado pero error en notificaciones"];
    
    // Limpiar y enviar JSON
    ob_end_clean();
    echo json_encode($response);
    
} catch (PDOException $e) {
    $conn->rollBack();
    ob_end_clean();
    echo json_encode(["status" => "error", "message" => "Error en la base de datos: " . $e->getMessage()]);
}

// Asegurar que no hay nada después
exit;
?>
