<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT"); 
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

include 'conexionBD.php';

if ($_SERVER["REQUEST_METHOD"] === "PUT") { // Cambiamos a PUT para actualizar el estado
    // Obtener el ID del usuario desde la URL
    $id = isset($_GET["id"]) ? intval($_GET["id"]) : 0;

    if ($id > 0) {
        try {
            // Preparar la consulta para actualizar el estado del usuario
            $sql = "UPDATE usuarios SET estado = 1 WHERE ID_Usuario = :id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":id", $id, PDO::PARAM_INT);

            // Ejecutar la consulta
            if ($stmt->execute()) {
                // Verificar si se actualizó alguna fila
                if ($stmt->rowCount() > 0) {
                    echo json_encode(["success" => "Usuario desactivado correctamente"]);
                } else {
                    echo json_encode(["error" => "No se encontró el usuario con el ID proporcionado"]);
                }
            } else {
                echo json_encode(["error" => "Error al ejecutar la consulta"]);
            }
        } catch (PDOException $e) {
            // Manejar errores de la base de datos
            echo json_encode(["error" => "Error en la base de datos: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["error" => "ID inválido"]);
    }
} else {
    echo json_encode(["error" => "Método no permitido"]);
}

$conn = null;
?>
