<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
require('fpdf.php'); // Asegúrate de incluir la ruta correcta a FPDF

function generarFacturaPDF($idPedido, $email, $conn) {
    // Obtener los datos del pedido
    $queryPedido = "
    SELECT p.ID_Pedido, p.Fecha, p.Estado, p.Email, u.Nombre AS Usuario, 
           SUM(pd.Precio) AS Total
    FROM Pedidos p
    JOIN Usuarios u ON p.ID_Usuario = u.ID_Usuario
    JOIN PedidoDetalles pd ON p.ID_Pedido = pd.ID_Pedido
    WHERE p.ID_Pedido = :ID_Pedido
    GROUP BY p.ID_Pedido, p.Fecha, p.Estado, p.Email, u.Nombre";
    $stmtPedido = $conn->prepare($queryPedido);
    $stmtPedido->bindParam(':ID_Pedido', $idPedido);
    $stmtPedido->execute();
    $pedido = $stmtPedido->fetch(PDO::FETCH_ASSOC);

    // Verificar si la consulta devuelve datos
    if (!$pedido) {
        echo json_encode(["error" => "No se encontraron datos para el pedido"]);
        exit;
    }

    // Obtener los detalles del pedido
    $queryDetalles = "
    SELECT pd.ID_Producto, pd.Cantidad, pd.Precio, pr.Nombre 
    FROM PedidoDetalles pd
    JOIN Productos pr ON pd.ID_Producto = pr.ID_Producto 
    WHERE pd.ID_Pedido = :ID_Pedido";
    $stmtDetalles = $conn->prepare($queryDetalles);
    $stmtDetalles->bindParam(':ID_Pedido', $idPedido);
    $stmtDetalles->execute();
    $detalles = $stmtDetalles->fetchAll(PDO::FETCH_ASSOC);

    // Verificar si la consulta de detalles devuelve datos
    if (!$detalles) {
        echo json_encode(["error" => "No se encontraron detalles para el pedido"]);
        exit;
    }

    // Crear el PDF
    $pdf = new FPDF();
    $pdf->AddPage();
    $pdf->SetFont('Arial', 'B', 16);

    // Título de la factura
    $pdf->Cell(0, 10, 'Factura del Pedido #' . $pedido['ID_Pedido'], 0, 1, 'C');
    $pdf->Ln(10);

    // Información del cliente
    $pdf->SetFont('Arial', '', 12);
    $pdf->Cell(0, 10, 'Cliente: ' . $pedido['Usuario'], 0, 1); // Corregido de 'Cliente' a 'Usuario'
    $pdf->Cell(0, 10, 'Email: ' . $pedido['Email'], 0, 1);
    $pdf->Cell(0, 10, 'Fecha: ' . $pedido['Fecha'], 0, 1);
    $pdf->Ln(10);

    // Detalles del pedido
    $pdf->SetFont('Arial', 'B', 12);
    $pdf->Cell(40, 10, 'Producto', 1, 0, 'C');
    $pdf->Cell(40, 10, 'Cantidad', 1, 0, 'C');
    $pdf->Cell(40, 10, 'Precio Unitario', 1, 0, 'C');
    $pdf->Cell(40, 10, 'Total', 1, 1, 'C');

    $pdf->SetFont('Arial', '', 12);
    foreach ($detalles as $detalle) {
        $total = $detalle['Cantidad'] * $detalle['Precio'];
        $pdf->Cell(40, 10, $detalle['Nombre'], 1, 0);
        $pdf->Cell(40, 10, $detalle['Cantidad'], 1, 0, 'C');
        $pdf->Cell(40, 10, '$' . number_format($detalle['Precio'], 2), 1, 0, 'R');
        $pdf->Cell(40, 10, '$' . number_format($total, 2), 1, 1, 'R');
    }

    // Total del pedido
    $pdf->Ln(10);
    $pdf->Cell(0, 10, 'Total del Pedido: $' . number_format($pedido['Total'], 2), 0, 1, 'R');

    // Guardar el PDF en un archivo
    $nombreArchivo = 'factura_pedido_' . $idPedido . '.pdf';
    if ($pdf->Output('F', $nombreArchivo) === false) {
        echo json_encode(["error" => "No se pudo generar el archivo PDF"]);
        exit;
    }

    return $nombreArchivo; // Devuelve el nombre del archivo generado
}

// Obtener los datos del cuerpo de la solicitud
$inputData = json_decode(file_get_contents("php://input"), true);

// Verificar si el JSON es válido
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(["error" => "JSON inválido", "detalle" => json_last_error_msg()]);
    exit;
}

// Verificar que el ID del pedido y el correo electrónico estén presentes en los datos
if (!isset($inputData['idPedido']) || !isset($inputData['email'])) {
    echo json_encode(["error" => "Faltan parámetros requeridos"]);
    exit;
}

// Aquí se establecería la conexión a la base de datos
// $conn = new PDO(...);

// Llamada a la función para generar la factura PDF
$nombreArchivo = generarFacturaPDF($inputData['idPedido'], $inputData['email'], $conn);

// Respuesta de éxito
echo json_encode(["success" => true, "mensaje" => "Factura generada con éxito", "archivo" => $nombreArchivo]);
exit;
?>
