<?php
// Asegurar que no haya output antes de los headers
ob_start();

// Incluir el archivo de FPDF
require '../fpdf186/fpdf.php';
require '../PHPMailer-master/src/Exception.php';
require '../PHPMailer-master/src/PHPMailer.php';
require '../PHPMailer-master/src/SMTP.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Configurar headers primero
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Configuración de errores
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

// Conexión con la base de datos
include 'conexionBD.php';

// Función para enviar respuesta JSON consistente
function sendJsonResponse($success, $message, $additionalData = []) {
    $response = array_merge([
        'success' => $success,
        'message' => $message
    ], $additionalData);
    
    echo json_encode($response);
    exit;
}

try {
    // Obtener y validar datos JSON
    $json = file_get_contents('php://input');
    if (empty($json)) {
        sendJsonResponse(false, 'No se recibieron datos');
    }
    
    $inputData = json_decode($json, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendJsonResponse(false, 'JSON inválido: ' . json_last_error_msg());
    }

    // Validar campos requeridos
    $requiredFields = ['transactionId', 'payerName', 'amount', 'idPedido', 'payerEmail'];
    foreach ($requiredFields as $field) {
        if (!isset($inputData[$field])) {
            sendJsonResponse(false, "Falta el campo requerido: $field");
        }
    }

    // Asignar variables
    $transactionId = htmlspecialchars($inputData['transactionId'], ENT_QUOTES, 'UTF-8');
    $payerName = htmlspecialchars($inputData['payerName'], ENT_QUOTES, 'UTF-8');
    $amount = (float)$inputData['amount'];
    $idPedido = (int)$inputData['idPedido'];
    $payerEmail = filter_var($inputData['payerEmail'], FILTER_VALIDATE_EMAIL);

    // Validaciones adicionales
    if (!$payerEmail) {
        sendJsonResponse(false, 'Email inválido');
    }
    if ($amount <= 0) {
        sendJsonResponse(false, 'Monto inválido');
    }
    if ($idPedido <= 0) {
        sendJsonResponse(false, 'ID de pedido inválido');
    }

    // Obtener el nombre del cliente desde la base de datos
    $queryCliente = "SELECT u.Nombre 
                    FROM Pedidos p
                    JOIN Usuarios u ON p.ID_Usuario = u.ID_Usuario
                    WHERE p.ID_Pedido = :ID_Pedido";
    $stmtCliente = $conn->prepare($queryCliente);
    $stmtCliente->bindParam(':ID_Pedido', $idPedido, PDO::PARAM_INT);
    $stmtCliente->execute();
    $cliente = $stmtCliente->fetch(PDO::FETCH_ASSOC);

    if (!$cliente || !isset($cliente['Nombre'])) {
        throw new Exception("No se pudo obtener la información del cliente");
    }

    $nombreCliente = $cliente['Nombre'];

    // Registrar el pago en la tabla Pagos
    $query = "INSERT INTO Pagos (Monto_Total, Estado, ID_Pedido) VALUES (:Monto_Total, :Estado, :ID_Pedido)";
    $stmt = $conn->prepare($query);
    $estado = 'Completado';
    $stmt->bindParam(':Monto_Total', $amount, PDO::PARAM_STR);
    $stmt->bindParam(':Estado', $estado, PDO::PARAM_STR);
    $stmt->bindParam(':ID_Pedido', $idPedido, PDO::PARAM_INT);
    $stmt->execute();

    // Obtener el ID del pago registrado
    $idPago = $conn->lastInsertId();

    // Registrar el método de pago (PayPal)
    $queryMetodo = "INSERT INTO Metodo_Pago (Tipo, Detalle, ID_Pago) VALUES (:Tipo, :Detalle, :ID_Pago)";
    $stmtMetodo = $conn->prepare($queryMetodo);
    $tipo = 'PayPal';
    $detalle = 'Transaction ID: ' . $transactionId . ', Payer: ' . $nombreCliente;
    $stmtMetodo->bindParam(':Tipo', $tipo, PDO::PARAM_STR);
    $stmtMetodo->bindParam(':Detalle', $detalle, PDO::PARAM_STR);
    $stmtMetodo->bindParam(':ID_Pago', $idPago, PDO::PARAM_INT);
    $stmtMetodo->execute();

    // Actualizar el estado del pedido a "Enviado"
    $queryUpdatePedido = "UPDATE Pedidos SET Estado = 'Enviado' WHERE ID_Pedido = :ID_Pedido";
    $stmtUpdatePedido = $conn->prepare($queryUpdatePedido);
    $stmtUpdatePedido->bindParam(':ID_Pedido', $idPedido, PDO::PARAM_INT);
    $stmtUpdatePedido->execute();

    // Obtener los detalles COMPLETOS del pedido
    $queryDetalles = "SELECT pd.ID_Producto, pd.Cantidad, p.Nombre AS NombreProducto, p.Precio 
                     FROM PedidoDetalles pd
                     JOIN Productos p ON pd.ID_Producto = p.ID_Producto
                     WHERE pd.ID_Pedido = :ID_Pedido";
    $stmtDetalles = $conn->prepare($queryDetalles);
    $stmtDetalles->bindParam(':ID_Pedido', $idPedido, PDO::PARAM_INT);
    $stmtDetalles->execute();
    $detalles = $stmtDetalles->fetchAll(PDO::FETCH_ASSOC);

    if (!$detalles) {
        throw new Exception("No se encontraron detalles para el pedido #" . $idPedido);
    }

    // Actualizar el stock en la tabla Inventario
    foreach ($detalles as $detalle) {
        $idProducto = $detalle['ID_Producto'];
        $cantidad = $detalle['Cantidad'];

        $queryUpdateStock = "UPDATE Inventario SET Cantidad_Disponible = Cantidad_Disponible - :Cantidad WHERE ID_Producto = :ID_Producto";
        $stmtUpdateStock = $conn->prepare($queryUpdateStock);
        $stmtUpdateStock->bindParam(':Cantidad', $cantidad, PDO::PARAM_INT);
        $stmtUpdateStock->bindParam(':ID_Producto', $idProducto, PDO::PARAM_INT);
        $stmtUpdateStock->execute();
    }

    // Crear la carpeta 'recibos' si no existe
    if (!file_exists('recibos')) {
        if (!mkdir('recibos', 0777, true)) {
            throw new Exception("No se pudo crear el directorio 'recibos'");
        }
    }

    // Verificar permisos de escritura
    if (!is_writable('recibos')) {
        throw new Exception("No se puede escribir en el directorio 'recibos'");
    }

    // Crear el PDF
    $pdf = new FPDF();
    $pdf->AddPage();

    // Configuración inicial
    $leftMargin = 15;
    $rightMargin = 15;
    $pdf->SetMargins($leftMargin, 15, $rightMargin);

    // Agregar logo (ajusta la ruta según tu estructura)
    $logoPath = 'uploads/Captura de pantalla 2025-02-17 224603.png';
    if(file_exists($logoPath)) {
        $pdf->Image($logoPath, $leftMargin, 10, 30); // Logo a la izquierda
    }

    // Encabezado principal
    $pdf->SetFont('Arial', 'B', 16);
    $pdf->SetXY($leftMargin + 35, 12); // Posición a la derecha del logo
    $pdf->Cell(0, 8, 'BEKUBES - Recibo de Pago', 0, 1);
    $pdf->SetFont('Arial', '', 10);
    $pdf->SetX($leftMargin + 35);
    $pdf->Cell(0, 6, 'Tienda especializada en cubos Rubik', 0, 1);
    $pdf->Ln(15);

    // Línea decorativa
    $pdf->SetDrawColor(200, 200, 200);
    $pdf->Line($leftMargin, $pdf->GetY(), 210 - $rightMargin, $pdf->GetY());
    $pdf->Ln(8);

    // Información de la transacción (en dos columnas)
    $pdf->SetFont('Arial', '', 11);
    $pdf->Cell(45, 8, 'Fecha:', 0, 0);
    $pdf->Cell(0, 8, date('d/m/Y H:i:s'), 0, 1);
    $pdf->Cell(45, 8, 'No. Transaccion:', 0, 0);
    $pdf->Cell(0, 8, $transactionId, 0, 1);
    $pdf->Cell(45, 8, 'No. Pedido:', 0, 0);
    $pdf->Cell(0, 8, $idPedido, 0, 1);
    $pdf->Ln(10);

    // Datos del cliente con fondo gris
    $pdf->SetFillColor(240, 240, 240);
    $pdf->SetFont('Arial', 'B', 12);
    $pdf->Cell(0, 8, 'Datos del Cliente', 0, 1, 'L', true);
    $pdf->SetFont('Arial', '', 11);
    $pdf->Cell(45, 8, 'Nombre:', 0, 0);
    $pdf->Cell(0, 8, utf8_decode($nombreCliente), 0, 1);
    $pdf->Cell(45, 8, 'Email:', 0, 0);
    $pdf->Cell(0, 8, $payerEmail, 0, 1);
    $pdf->Ln(12);

    // Tabla de productos con bordes y encabezado resaltado
    $pdf->SetFont('Arial', 'B', 11);
    // Encabezado de tabla con fondo
    $pdf->SetFillColor(220, 220, 220);
    $pdf->Cell(100, 10, 'Producto', 1, 0, 'L', true);
    $pdf->Cell(30, 10, 'Precio Unit.', 1, 0, 'C', true);
    $pdf->Cell(20, 10, 'Cantidad', 1, 0, 'C', true);
    $pdf->Cell(30, 10, 'Subtotal', 1, 1, 'C', true);

    // Productos
    $pdf->SetFont('Arial', '', 10);
    $total = 0;
    foreach ($detalles as $detalle) {
        $subtotal = $detalle['Precio'] * $detalle['Cantidad'];
        $total += $subtotal;
        
        $pdf->Cell(100, 8, utf8_decode($detalle['NombreProducto']), 1, 0);
        $pdf->Cell(30, 8, '$' . number_format($detalle['Precio'], 2), 1, 0, 'R');
        $pdf->Cell(20, 8, $detalle['Cantidad'], 1, 0, 'C');
        $pdf->Cell(30, 8, '$' . number_format($subtotal, 2), 1, 1, 'R');
    }

    // Total con estilo diferente
    $pdf->SetFont('Arial', 'B', 11);
    $pdf->Cell(150, 10, 'TOTAL:', 0, 0, 'R');
    $pdf->SetFillColor(240, 240, 240);
    $pdf->Cell(30, 10, '$' . number_format($total, 2), 1, 1, 'R', true);
    $pdf->Ln(15);

    // Pie de página con líneas y texto más pequeño
    $pdf->SetDrawColor(200, 200, 200);
    $pdf->Line($leftMargin, $pdf->GetY(), 210 - $rightMargin, $pdf->GetY());
    $pdf->Ln(5);
    $pdf->SetFont('Arial', 'I', 9);
    $pdf->MultiCell(0, 5, utf8_decode('Gracias por su compra. Para cualquier consulta, por favor contacte a nuestro servicio al cliente.'));
    $pdf->Cell(0, 5, utf8_decode('Estado del pedido: Enviado'), 0, 1);
    $pdf->Ln(3);
    $pdf->SetFont('Arial', '', 8);
    $pdf->Cell(0, 5, date('d/m/Y H:i:s') . ' - Documento generado automaticamente', 0, 1, 'C');

    // Guardar el PDF
    $pdfOutputPath = 'recibos/pago_' . $idPago . '.pdf';
    $pdf->Output('F', $pdfOutputPath);

    if (!file_exists($pdfOutputPath)) {
        throw new Exception("No se pudo generar el archivo PDF.");
    }

    // Guardar la factura en la tabla Facturas
    $queryFactura = "INSERT INTO Facturas (ID_Pedido, Ruta_PDF) VALUES (:ID_Pedido, :Ruta_PDF)";
    $stmtFactura = $conn->prepare($queryFactura);
    $stmtFactura->bindParam(':ID_Pedido', $idPedido, PDO::PARAM_INT);
    $stmtFactura->bindParam(':Ruta_PDF', $pdfOutputPath, PDO::PARAM_STR);
    $stmtFactura->execute();

    // Enviar el correo con el PDF adjunto
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'crissnchz983@gmail.com';
    $mail->Password = 'odmy iqen gjkp dzjg';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    $mail->setFrom('crissnchz983@gmail.com', 'Bekubes');
    $mail->addAddress($payerEmail);
    $mail->isHTML(true);
    $mail->Subject = 'Recibo de Pago - Pedido #' . $idPedido;
    $mail->Body = '
        <h2>Gracias por su compra en Bekubes</h2>
        <p>Adjunto encontrará el recibo de pago correspondiente a su pedido #' . $idPedido . '.</p>
        <p><strong>Resumen:</strong></p>
        <ul>
            <li>No. Pedido: ' . $idPedido . '</li>
            <li>Fecha: ' . date('d/m/Y') . '</li>
            <li>Total: $' . number_format($total, 2) . '</li>
            <li>Estado: Enviado</li>
        </ul>
        <p>Para cualquier consulta, no dude en contactarnos.</p>
    ';

    $mail->addAttachment($pdfOutputPath);
    $mail->send();

    // Limpiar buffer y enviar respuesta JSON
    ob_end_clean();
    sendJsonResponse(true, 'Pago procesado y factura enviada correctamente', [
        'pdf_path' => $pdfOutputPath,
        'order_id' => $idPedido,
        'transaction_id' => $transactionId,
        'amount' => $amount,
        'payer_email' => $payerEmail
    ]);

} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    sendJsonResponse(false, 'Error en la base de datos: ' . $e->getMessage());
} catch (Exception $e) {
    error_log("General error: " . $e->getMessage());
    sendJsonResponse(false, $e->getMessage());
}
?>