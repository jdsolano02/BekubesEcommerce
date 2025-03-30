<?php

// Incluir el archivo de FPDF
require '../fpdf186/fpdf.php'; // Asegúrate de que la ruta sea correcta

require '../PHPMailer-master/src/Exception.php';
require '../PHPMailer-master/src/PHPMailer.php';
require '../PHPMailer-master/src/SMTP.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Habilitar la visualización de errores
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Conexión con la base de datos
include 'conexionBD.php';

try {
    // Obtener los datos del pago enviados desde el frontend (React)
    $inputData = json_decode(file_get_contents("php://input"), true);

    // Verificar que los datos estén presentes
    if (!isset($inputData['transactionId'], $inputData['payerName'], $inputData['amount'], $inputData['idPedido'], $inputData['payerEmail'])) {
        throw new Exception("Faltan datos en la solicitud");
    }

    $transactionId = $inputData['transactionId'];
    $payerName = $inputData['payerName'];
    $amount = $inputData['amount'];
    $idPedido = $inputData['idPedido'];
    $payerEmail = $inputData['payerEmail'];  // Email del pagador (desde localStorage)

    // Registrar el pago en la tabla Pagos
    $query = "INSERT INTO Pagos (Monto_Total, Estado, ID_Pedido) VALUES (:Monto_Total, :Estado, :ID_Pedido)";
    $stmt = $conn->prepare($query);

    // Usar variables explícitas para bindParam
    $estado = 'Completado'; // Variable para el estado
    $stmt->bindParam(':Monto_Total', $amount);
    $stmt->bindParam(':Estado', $estado); // Ahora es una variable
    $stmt->bindParam(':ID_Pedido', $idPedido);
    $stmt->execute();

    // Obtener el ID del pago registrado
    $idPago = $conn->lastInsertId();

    // Registrar el método de pago (PayPal)
    $queryMetodo = "INSERT INTO Metodo_Pago (Tipo, Detalle, ID_Pago) VALUES (:Tipo, :Detalle, :ID_Pago)";
    $stmtMetodo = $conn->prepare($queryMetodo);

    // Usar variables explícitas para bindParam
    $tipo = 'PayPal'; // Variable para el tipo de pago
    $detalle = 'Transaction ID: ' . $transactionId . ', Payer: ' . $payerName; // Variable para el detalle
    $stmtMetodo->bindParam(':Tipo', $tipo); // Ahora es una variable
    $stmtMetodo->bindParam(':Detalle', $detalle); // Ahora es una variable
    $stmtMetodo->bindParam(':ID_Pago', $idPago);
    $stmtMetodo->execute();

    // Actualizar el estado del pedido a "Enviado"
    $queryUpdatePedido = "UPDATE Pedidos SET Estado = 'Enviado' WHERE ID_Pedido = :ID_Pedido";
    $stmtUpdatePedido = $conn->prepare($queryUpdatePedido);
    $stmtUpdatePedido->bindParam(':ID_Pedido', $idPedido);
    $stmtUpdatePedido->execute();

    // Obtener los detalles del pedido (productos y cantidades)
    $queryDetalles = "SELECT ID_Producto, Cantidad FROM PedidoDetalles WHERE ID_Pedido = :ID_Pedido";
    $stmtDetalles = $conn->prepare($queryDetalles);
    $stmtDetalles->bindParam(':ID_Pedido', $idPedido);
    $stmtDetalles->execute();
    $detalles = $stmtDetalles->fetchAll(PDO::FETCH_ASSOC);

    // Actualizar el stock en la tabla Inventario
    foreach ($detalles as $detalle) {
        $idProducto = $detalle['ID_Producto'];
        $cantidad = $detalle['Cantidad'];

        // Restar la cantidad comprada del stock
        $queryUpdateStock = "UPDATE Inventario SET Cantidad_Disponible = Cantidad_Disponible - :Cantidad WHERE ID_Producto = :ID_Producto";
        $stmtUpdateStock = $conn->prepare($queryUpdateStock);
        $stmtUpdateStock->bindParam(':Cantidad', $cantidad);
        $stmtUpdateStock->bindParam(':ID_Producto', $idProducto);
        $stmtUpdateStock->execute();
    }

    // Crear la carpeta 'recibos' si no existe
    if (!file_exists('recibos')) {
        mkdir('recibos', 0777, true); // Crear la carpeta con permisos de escritura
    }

    // Crear el PDF
    $pdf = new FPDF();
    $pdf->AddPage();
    $pdf->SetFont('Arial', 'B', 16); // Usar Arial en lugar de Helvetica
    $pdf->Cell(40, 10, 'Recibo de Pago');
    $pdf->Ln(10);

    // Agregar detalles del pago
    $pdf->SetFont('Arial', '', 12); // Usar Arial en lugar de Helvetica
    $pdf->Cell(40, 10, 'Transaccion ID: ' . $transactionId);
    $pdf->Ln(10);
    $pdf->Cell(40, 10, 'Nombre del Payer: ' . $payerName);
    $pdf->Ln(10);
    $pdf->Cell(40, 10, 'Monto Total: $' . $amount);
    $pdf->Ln(10);
    $pdf->Cell(40, 10, 'Estado del Pedido: Enviado');
    $pdf->Ln(10);
    $pdf->Cell(40, 10, 'ID Pedido: ' . $idPedido);
    $pdf->Ln(10);

    // Detalles del pedido
    $pdf->Ln(10);
    $pdf->Cell(40, 10, 'Detalles del Pedido:');
    $pdf->Ln(10);

    foreach ($detalles as $detalle) {
        $pdf->Cell(40, 10, 'Producto ID: ' . $detalle['ID_Producto'] . ' - Cantidad: ' . $detalle['Cantidad']);
        $pdf->Ln(10);
    }

    // Salvar el archivo PDF
    $pdfOutputPath = 'recibos/pago_' . $idPago . '.pdf';
    $pdf->Output('F', $pdfOutputPath);  // Guardar el archivo

    // Verificar que el archivo PDF se haya creado
    if (!file_exists($pdfOutputPath)) {
        throw new Exception("No se pudo generar el archivo PDF.");
    }

    // Verificar el tamaño del archivo PDF
    $fileSize = filesize($pdfOutputPath);
    if ($fileSize > 10485760) { // 10 MB
        throw new Exception("El archivo PDF es demasiado grande.");
    }
    // Guardar la factura en la tabla Facturas
$queryFactura = "INSERT INTO Facturas (ID_Pedido, Ruta_PDF) VALUES (:ID_Pedido, :Ruta_PDF)";
$stmtFactura = $conn->prepare($queryFactura);
$stmtFactura->bindParam(':ID_Pedido', $idPedido);
$stmtFactura->bindParam(':Ruta_PDF', $pdfOutputPath);
$stmtFactura->execute();

    // Enviar el correo con el PDF adjunto
    $mail = new PHPMailer(true); // Habilitar excepciones

    // Configuración del servidor SMTP
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com'; // Servidor SMTP de Gmail
    $mail->SMTPAuth = true;
    $mail->Username = 'crissnchz983@gmail.com'; // Tu correo
    $mail->Password = 'odmy iqen gjkp dzjg'; // Tu contraseña (usar clave de aplicación si es Gmail)
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // Usar TLS
    $mail->Port = 587; // Puerto para TLS

    // Remitente y destinatario
    $mail->setFrom('crissnchz983@gmail.com', 'Bekubes');
    $mail->addAddress($payerEmail); // Correo del pagador (desde localStorage)

    // Contenido del correo
    $mail->isHTML(true);
    $mail->Subject = 'Recibo de Pago';
    $mail->Body = 'Adjunto el recibo de pago correspondiente a su pedido.';

    // Adjuntar el archivo PDF
    if (file_exists($pdfOutputPath)) {
        $mail->addAttachment($pdfOutputPath);
    } else {
        throw new Exception("El archivo PDF no existe: " . $pdfOutputPath);
    }

    // Enviar el correo
    $mail->send();
    echo json_encode(['success' => true, 'message' => 'Correo enviado correctamente.']);
} catch (PDOException $e) {
    // Error de base de datos
    echo json_encode(['error' => 'Error en la base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    // Error general
    echo json_encode(['error' => $e->getMessage()]);
}
?>