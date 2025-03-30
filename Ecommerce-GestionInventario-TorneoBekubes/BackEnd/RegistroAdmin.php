<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include 'conexionBD.php';
require '../PHPMailer-master/src/PHPMailer.php';
require '../PHPMailer-master/src/SMTP.php';
require '../PHPMailer-master/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Obtener datos enviados desde el frontend
$data = json_decode(file_get_contents("php://input"), true);

// Verificar si los datos se recibieron correctamente
if (!$data) {
    echo json_encode(["status" => "error", "message" => "Datos no recibidos."]);
    exit;
}

$nombre = $data['nombre'] ?? '';
$apellido1 = $data['apellido1'] ?? '';
$apellido2 = $data['apellido2'] ?? '';
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';
$rol = $data['rol'] ?? '';

if (empty($nombre) || empty($apellido1) || empty($email) || empty($password) || empty($rol)) {
    echo json_encode(["status" => "error", "message" => "Todos los campos obligatorios deben completarse."]);
    exit;
}

// Verificar si el correo ya está registrado
$query = "SELECT Email FROM Usuarios WHERE Email = :email";
$stmt = $conn->prepare($query);
$stmt->bindParam(':email', $email);
$stmt->execute();

if ($stmt->rowCount() > 0) {
    echo json_encode(["status" => "error", "message" => "El correo ya está registrado."]);
    exit;
}

// Registrar al usuario
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Generar token y fecha límite
$token = bin2hex(random_bytes(16)); // Genera un token único
$fechaLimite = date('Y-m-d H:i:s', strtotime('+24 hours')); // 24 horas para validar

$query = "INSERT INTO Usuarios (Nombre, Apellido1, Apellido2, Email, Password, Rol, TokenVerificacion, FechaLimiteVerificacion) 
          VALUES (:nombre, :apellido1, :apellido2, :email, :password, :rol, :token, :fechaLimite)";
$stmt = $conn->prepare($query);

$stmt->bindParam(':nombre', $nombre);
$stmt->bindParam(':apellido1', $apellido1);
$stmt->bindParam(':apellido2', $apellido2);
$stmt->bindParam(':email', $email);
$stmt->bindParam(':password', $hashedPassword);
$stmt->bindParam(':rol', $rol);
$stmt->bindParam(':token', $token);
$stmt->bindParam(':fechaLimite', $fechaLimite);

if ($stmt->execute()) {
    // Obtener ID del usuario recién registrado
    $idUsuario = $conn->lastInsertId();

    // Enviar correo de verificación
    $mail = new PHPMailer(true);
    try {
        // Configuración del servidor SMTP
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com'; 
        $mail->SMTPAuth = true;
        $mail->Username = 'crissnchz983@gmail.com'; 
        $mail->Password = 'odmy iqen gjkp dzjg'; 
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        // Configuración del correo
        $mail->setFrom('crissnchz983@gmail.com', 'Bekubes');
        $mail->addAddress($email);

        $mail->isHTML(true);
        $mail->Subject = 'Confirma tu cuenta';
        $urlConfirmacion = "http://localhost/Ecommerce-GestionInventario-TorneoBekubes/BackEnd/validarCuenta.php?token=$token";
        $mail->Body = "Hola $nombre,<br><br>Gracias por registrarte. Por favor, confirma tu cuenta haciendo clic en el siguiente enlace:<br><br>
                       <a href='$urlConfirmacion'>Confirmar cuenta</a><br><br>
                       Este enlace expirará en 24 horas.";

        $mail->send();

        // Actualizar tabla `Historial_Usuarios`
        $queryHistorial = "INSERT INTO Historial_Usuarios (UsuarioCreacion, ID_Usuario) 
                           VALUES (CURRENT_TIMESTAMP, :idUsuario)";
        $stmtHistorial = $conn->prepare($queryHistorial);
        $stmtHistorial->bindParam(':idUsuario', $idUsuario);
        $stmtHistorial->execute();

        echo json_encode(["status" => "success", "message" => "Registro exitoso. Revisa tu correo para confirmar tu cuenta."]);
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => "Registro exitoso, pero no se pudo enviar el correo de confirmación."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Error al registrar el usuario."]);
}

?>