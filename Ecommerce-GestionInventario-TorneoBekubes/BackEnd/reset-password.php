<?php
header("Access-Control-Allow-Origin: http://localhost:3000"); 
header("Access-Control-Allow-Methods: POST, GET, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization"); 
header("Content-Type: application/json; charset=UTF-8");

// Manejar la solicitud OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir la conexión a la base de datos
include 'conexionBD.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Leer los datos JSON del cuerpo de la solicitud
    $input = json_decode(file_get_contents("php://input"), true);
    $token = $input["token"];
    $newPassword = $input["newPassword"];

    // Verificar si el token es válido y no ha expirado
    $stmt = $conn->prepare("SELECT ID_Usuario FROM usuarios WHERE reset_token = :token AND token_expiration > NOW()");
    $stmt->bindParam(":token", $token);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Actualizar la contraseña
        $hash = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("UPDATE usuarios SET password = :hash, reset_token = NULL, token_expiration = NULL WHERE ID_Usuario = :id");
        $stmt->bindParam(":hash", $hash);
        $stmt->bindParam(":id", $user["ID_Usuario"]);
        $stmt->execute();

        echo json_encode(["success" => "Contraseña restablecida correctamente."]);
    } else {
        echo json_encode(["error" => "Token inválido o expirado."]);
    }
} else {
    echo json_encode(["error" => "Método no permitido."]);
}
?>