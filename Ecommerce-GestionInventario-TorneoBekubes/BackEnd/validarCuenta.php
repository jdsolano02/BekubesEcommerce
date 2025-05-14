<?php
header('Content-Type: text/html; charset=UTF-8');
mb_internal_encoding('UTF-8');

include 'conexionBD.php';

$token = $_GET['token'] ?? '';

function mostrarPagina($titulo, $mensaje, $esExito = false) {
    $color = $esExito ? '#2ecc71' : '#e74c3c';
    $icono = $esExito ? '✅' : '❌';
    
    echo <<<HTML
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verificación de Cuenta</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                color: #2c3e50;
            }
            .container {
                text-align: center;
                background: white;
                padding: 3rem;
                border-radius: 15px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                max-width: 600px;
                width: 90%;
                animation: fadeIn 0.5s ease-out;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            h1 {
                color: $color;
                margin-bottom: 1.5rem;
            }
            .icon {
                font-size: 4rem;
                margin-bottom: 1.5rem;
                animation: bounce 0.5s;
            }
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
                40% {transform: translateY(-20px);}
                60% {transform: translateY(-10px);}
            }
            p {
                font-size: 1.1rem;
                line-height: 1.6;
                margin-bottom: 2rem;
            }
            .btn {
                display: inline-block;
                background: $color;
                color: white;
                padding: 12px 30px;
                border-radius: 30px;
                text-decoration: none;
                font-weight: 600;
                transition: all 0.3s;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 7px 14px rgba(0, 0, 0, 0.15);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">$icono</div>
            <h1>$titulo</h1>
            <p>$mensaje</p>
        </div>
    </body>
    </html>
HTML;
    exit;
}

if (empty($token)) {
    mostrarPagina("Token no válido", "El enlace de verificación no contiene un token válido.");
}

// Verificar token
$query = "SELECT ID_Usuario, FechaLimiteVerificacion FROM Usuarios WHERE TokenVerificacion = :token AND Verificado = 0";
$stmt = $conn->prepare($query);
$stmt->bindParam(':token', $token);
$stmt->execute();

if ($stmt->rowCount() === 0) {
    mostrarPagina("Token inválido", "El token no es válido o ya ha sido utilizado.");
}

$result = $stmt->fetch();
$fechaLimite = $result['FechaLimiteVerificacion'];

if (strtotime($fechaLimite) < time()) {
    mostrarPagina("Token expirado", "El enlace de verificación ha expirado. Por favor solicita uno nuevo.");
}

// Marcar usuario como verificado
$query = "UPDATE Usuarios SET Verificado = 1, TokenVerificacion = NULL WHERE TokenVerificacion = :token";
$stmt = $conn->prepare($query);
$stmt->bindParam(':token', $token);
$stmt->execute();

mostrarPagina("¡Cuenta verificada!", "¡Felicidades! Tu cuenta ha sido verificada con éxito. Ahora puedes disfrutar de todos los beneficios.", true);
?>