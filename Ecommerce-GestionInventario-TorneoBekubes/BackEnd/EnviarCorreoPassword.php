<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

include 'conexionBD.php';

require '../PHPMailer-master/src/Exception.php';
require '../PHPMailer-master/src/PHPMailer.php';
require '../PHPMailer-master/src/SMTP.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");



if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Verificar si los datos POST están llegando
    $input = json_decode(file_get_contents("php://input"), true);
    $email = $input["email"];

    error_log("Correo recibido: " . $email); // Log para verificar el correo

    // Conectar a la base de datos
    include 'conexionBD.php';

    // Verificar si el correo existe en la base de datos
    $stmt = $conn->prepare("SELECT ID_Usuario FROM usuarios WHERE email = :email");
    $stmt->bindParam(":email", $email);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Generar un token único
        $token = bin2hex(random_bytes(32));
        $expira = date("Y-m-d H:i:s", strtotime("+1 hour")); // El token expira en 1 hora

        // Guardar el token en la base de datos
        $stmt = $conn->prepare("UPDATE usuarios SET reset_token = :token, token_expiration = :expira WHERE ID_Usuario = :id");
        $stmt->bindParam(":token", $token);
        $stmt->bindParam(":expira", $expira);
        $stmt->bindParam(":id", $user["ID_Usuario"]);
        $stmt->execute();

        // Enviar el correo con PHPMailer
        $mail = new PHPMailer(true);

        try {

        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com'; // Cambiar si usas otro proveedor
        $mail->SMTPAuth = true;
        $mail->Username = 'crissnchz983@gmail.com'; // Tu correo
        $mail->Password = 'odmy iqen gjkp dzjg'; // Tu contraseña (usar clave de aplicación si es Gmail)
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

            // Destinatario
            $mail->setFrom('crissnchz983@gmail.com', 'Bekubes');
            $mail->addAddress($email);

            // Contenido del correo
            $mail->isHTML(true);
            $mail->Subject = 'Restablecer contraseña';
            $mail->Body = "Haz clic en el siguiente enlace para restablecer tu contraseña: <a href='http://localhost:3000/change-password?token=$token'>Restablecer contraseña</a>";

            $mail->send();
            echo json_encode(["success" => "Correo enviado. Revisa tu bandeja de entrada."]);
        } catch (Exception $e) {
            error_log("Error al enviar el correo: " . $e->getMessage()); // Log del error
            echo json_encode(["error" => "Error al enviar el correo: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["error" => "El correo no está registrado."]);
    }
} else {
    echo json_encode(["error" => "Método no permitido."]);
}