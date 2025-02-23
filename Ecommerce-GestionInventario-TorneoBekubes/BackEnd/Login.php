<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require 'conexionBD.php'; 

$data = json_decode(file_get_contents("php://input"), true);

$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(["status" => "error", "message" => "Debe ingresar correo y contraseña."]);
    exit;
}

// Verificar las credenciales del usuario
$query = "SELECT ID_Usuario, Password, Rol, verificado, Estado FROM Usuarios WHERE Email = :email";
$stmt = $conn->prepare($query);
$stmt->bindParam(':email', $email);
$stmt->execute();

$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    if (password_verify($password, $user['Password'])) {
        // Verificar si la cuenta está activa
        if ($user['verificado'] == 1) {
            // Verificar si la cuenta está habilitada
            if ($user['Estado'] == 0) {
                // Credenciales correctas, cuenta verificada y habilitada, iniciar sesión
                $_SESSION['user_id'] = $user['ID_Usuario'];
                $_SESSION['role'] = $user['Rol'];

                echo json_encode([
                    "status" => "success",
                    "message" => "Inicio de sesión exitoso.",
                    "user_id" => $user['ID_Usuario'],
                    "role" => $user['Rol'],
                ]);
            } else {
                // Cuenta deshabilitada
                echo json_encode(["status" => "error", "message" => "Su cuenta ha sido deshabilitada. Por favor, contacte con los administradores."]);
            }
        } else {
            // Cuenta no verificada
            echo json_encode(["status" => "error", "message" => "Tu cuenta no está verificada. Por favor, verifica tu cuenta."]);
        }
    } else {
        // Credenciales incorrectas
        echo json_encode(["status" => "error", "message" => "Credenciales incorrectas."]);
    }
} else {
    // Usuario no encontrado
    echo json_encode(["status" => "error", "message" => "Credenciales incorrectas."]);
}
?>