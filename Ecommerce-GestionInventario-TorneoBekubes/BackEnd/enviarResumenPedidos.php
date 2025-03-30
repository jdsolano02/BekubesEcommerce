<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Manejar solicitud OPTIONS para preflight (evita doble envío)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'conexionBD.php';
require '../PHPMailer-master/src/PHPMailer.php';
require '../PHPMailer-master/src/SMTP.php';
require '../PHPMailer-master/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Sistema de bloqueo para evitar envíos duplicados
$lockFile = __DIR__ . '/email_sending.lock';
$lockTimeout = 300; // 5 minutos de timeout para el bloqueo

// Verificar si ya hay un envío en proceso
if (file_exists($lockFile)) {
    $lockTime = filemtime($lockFile);
    $currentTime = time();
    
    if (($currentTime - $lockTime) < $lockTimeout) {
        echo json_encode([
            "status" => "error",
            "message" => "El envío de correos ya está en proceso. Por favor espera."
        ]);
        exit;
    } else {
        // Eliminar archivo de bloqueo expirado
        unlink($lockFile);
    }
}

// Crear archivo de bloqueo
file_put_contents($lockFile, "Proceso iniciado: " . date('Y-m-d H:i:s'));

// Registrar en log
error_log("Inicio de envío de resúmenes - " . date('Y-m-d H:i:s'));

// Función para obtener pedidos recientes de un cliente
function obtenerPedidosCliente($conn, $emailCliente) {
    $query = "SELECT p.ID_Pedido, p.Fecha, p.Estado as EstadoPedido,
                     pd.ID_Producto, pd.Cantidad, pd.Precio,
                     pr.Nombre as NombreProducto
              FROM pedidos p
              JOIN pedidodetalles pd ON p.ID_Pedido = pd.ID_Pedido
              JOIN productos pr ON pd.ID_Producto = pr.ID_Producto
              WHERE p.Email = :email
              AND p.Fecha >= DATE_SUB(NOW(), INTERVAL 30 DAY)
              ORDER BY p.Fecha DESC";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':email', $emailCliente);
    $stmt->execute();
    
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Función para obtener el color según el estado
function getColorEstado($estado) {
    switch ($estado) {
        case 'Procesando':
            return '#3498db'; // Azul
        case 'Enviado':
            return '#f39c12'; // Naranja
        case 'Entregado':
            return '#27ae60'; // Verde
        default:
            return '#7f8c8d'; // Gris
    }
}

// Función mejorada para enviar resumen de pedidos
function enviarResumenCliente($conn, $emailCliente) {
    // Obtener pedidos del cliente
    $pedidos = obtenerPedidosCliente($conn, $emailCliente);
    
    if (empty($pedidos)) {
        return ['status' => 'skip', 'message' => 'No hay pedidos recientes'];
    }

    $mail = new PHPMailer(true);
    
    try {
        // Configuración SMTP
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'crissnchz983@gmail.com';
        $mail->Password = 'odmy iqen gjkp dzjg';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;
        $mail->CharSet = 'UTF-8';
        $mail->SMTPDebug = 0; // Desactivar debug para producción

        // Configurar remitente y destinatario
        $mail->setFrom('notificaciones@Bekubes.com', 'Bekubes - Equipo de Ventas');
        $mail->addAddress($emailCliente);

        // Organizar pedidos por ID_Pedido
        $pedidosAgrupados = [];
        foreach ($pedidos as $pedido) {
            $idPedido = $pedido['ID_Pedido'];
            if (!isset($pedidosAgrupados[$idPedido])) {
                $pedidosAgrupados[$idPedido] = [
                    'Fecha' => $pedido['Fecha'],
                    'Estado' => $pedido['EstadoPedido'],
                    'Productos' => []
                ];
            }
            $pedidosAgrupados[$idPedido]['Productos'][] = $pedido;
        }

        // Construir contenido del correo
        $contenido = "<h1 style='color: #2c3e50;'>Resumen de tus pedidos recientes</h1>";
        $contenido .= "<p>Aquí tienes un resumen de tus pedidos en los últimos 30 días:</p>";

        $totalGeneral = 0;
        
        foreach ($pedidosAgrupados as $idPedido => $pedido) {
            $colorEstado = getColorEstado($pedido['Estado']);
            
            $contenido .= "<div style='margin-bottom: 30px; border-left: 4px solid $colorEstado; padding-left: 10px;'>";
            $contenido .= "<h3 style='color: #3498db;'>Pedido #$idPedido - " . date('d/m/Y', strtotime($pedido['Fecha'])) . "</h3>";
            $contenido .= "<p style='margin-bottom: 10px;'><strong>Estado:</strong> <span style='color: $colorEstado; font-weight: bold;'>" . strtoupper($pedido['Estado']) . "</span></p>";
            
            $contenido .= "<table style='width: 100%; border-collapse: collapse; margin: 10px 0;'>";
            $contenido .= "<thead><tr style='background-color: #f8f9fa;'>";
            $contenido .= "<th style='padding: 10px; text-align: left; border-bottom: 1px solid #ddd;'>Producto</th>";
            $contenido .= "<th style='padding: 10px; text-align: center; border-bottom: 1px solid #ddd;'>Cantidad</th>";
            $contenido .= "<th style='padding: 10px; text-align: right; border-bottom: 1px solid #ddd;'>Precio Unitario</th>";
            $contenido .= "<th style='padding: 10px; text-align: right; border-bottom: 1px solid #ddd;'>Total</th>";
            $contenido .= "</tr></thead><tbody>";
            
            $totalPedido = 0;
            
            foreach ($pedido['Productos'] as $producto) {
                $totalProducto = $producto['Cantidad'] * $producto['Precio'];
                $totalPedido += $totalProducto;
                
                $contenido .= "<tr>";
                $contenido .= "<td style='padding: 10px; border-bottom: 1px solid #eee;'>{$producto['NombreProducto']}</td>";
                $contenido .= "<td style='padding: 10px; border-bottom: 1px solid #eee; text-align: center;'>{$producto['Cantidad']}</td>";
                $contenido .= "<td style='padding: 10px; border-bottom: 1px solid #eee; text-align: right;'>₡" . number_format($producto['Precio'], 2) . "</td>";
                $contenido .= "<td style='padding: 10px; border-bottom: 1px solid #eee; text-align: right;'>₡" . number_format($totalProducto, 2) . "</td>";
                $contenido .= "</tr>";
            }
            
            $contenido .= "<tr><td colspan='3' style='text-align: right; padding: 10px; font-weight: bold;'>Total del pedido:</td>";
            $contenido .= "<td style='text-align: right; padding: 10px; font-weight: bold;'>₡" . number_format($totalPedido, 2) . "</td></tr>";
            $contenido .= "</tbody></table></div>";
            
            $totalGeneral += $totalPedido;
        }
        
        $contenido .= "<div style='margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;'>";
        $contenido .= "<h3 style='text-align: right; color: #27ae60;'>Total general: ₡" . number_format($totalGeneral, 2) . "</h3>";
        $contenido .= "</div>";
        
        // Sección de información de estados
        $contenido .= "<div style='margin-top: 30px; padding: 15px; background-color: #f0f7ff; border-radius: 5px;'>";
        $contenido .= "<h4 style='color: #2c3e50;'>Información sobre los estados:</h4>";
        $contenido .= "<ul style='list-style-type: none; padding-left: 0;'>";
        $contenido .= "<li><span style='display: inline-block; width: 12px; height: 12px; background-color: #3498db; margin-right: 8px;'></span> <strong>Procesando:</strong> Tu pedido está siendo preparado</li>";
        $contenido .= "<li><span style='display: inline-block; width: 12px; height: 12px; background-color: #f39c12; margin-right: 8px;'></span> <strong>Enviado:</strong> Tu pedido está en camino</li>";
        $contenido .= "<li><span style='display: inline-block; width: 12px; height: 12px; background-color: #27ae60; margin-right: 8px;'></span> <strong>Entregado:</strong> Tu pedido ha sido recibido</li>";
        $contenido .= "</ul></div>";
        
        $contenido .= "<p style='margin-top: 30px;'>¡Gracias por confiar en Bekubes!</p>";
        $contenido .= "<p><small>Si tienes alguna pregunta sobre tus pedidos, no dudes en contactarnos.</small></p>";

        $mail->isHTML(true);
        $mail->Subject = '📋 Resumen de tus pedidos en Bekubes';
        $mail->Body = $contenido;

        if (!$mail->send()) {
            throw new Exception($mail->ErrorInfo);
        }
        
        return ['status' => 'success', 'message' => 'Correo enviado correctamente'];
    } catch (Exception $e) {
        error_log("Error al enviar resumen a $emailCliente: " . $e->getMessage());
        return ['status' => 'error', 'message' => $e->getMessage()];
    }
}

// Procesar la solicitud
try {
    if (!$conn) {
        throw new Exception("Error de conexión a la base de datos");
    }

    // Obtener todos los clientes verificados con pedidos recientes
    $queryClientes = "SELECT DISTINCT p.Email 
                      FROM pedidos p
                      JOIN usuarios u ON p.Email = u.email
                      WHERE u.Verificado = 1 
                      AND u.rol = 'cliente'
                      AND p.Fecha >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
    
    $stmtClientes = $conn->query($queryClientes);
    $clientes = $stmtClientes->fetchAll(PDO::FETCH_COLUMN);

    $resultados = [
        'total_clientes' => count($clientes),
        'enviados' => 0,
        'errores' => 0,
        'detalles' => []
    ];

    foreach ($clientes as $emailCliente) {
        $resultado = enviarResumenCliente($conn, $emailCliente);
        
        if ($resultado['status'] === 'success') {
            $resultados['enviados']++;
        } elseif ($resultado['status'] === 'error') {
            $resultados['errores']++;
        }
        
        $resultados['detalles'][] = [
            'email' => $emailCliente,
            'status' => $resultado['status'],
            'message' => $resultado['message']
        ];
    }

    // Eliminar archivo de bloqueo al finalizar
    if (file_exists($lockFile)) {
        unlink($lockFile);
    }

    echo json_encode([
        "status" => "success",
        "message" => "Proceso de envío completado",
        "data" => $resultados
    ]);

} catch (Exception $e) {
    // Eliminar archivo de bloqueo en caso de error
    if (file_exists($lockFile)) {
        unlink($lockFile);
    }
    
    error_log("Error general: " . $e->getMessage());
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>