<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT"); 
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

include 'conexionBD.php';

if ($_SERVER["REQUEST_METHOD"] === "PUT") {
    // Obtener el ID del usuario desde la URL
    $id = isset($_GET["id"]) ? intval($_GET["id"]) : 0;

    if ($id > 0) {
        try {
            // Obtener el estado actual del usuario
            $sql = "SELECT estado FROM usuarios WHERE ID_Usuario = :id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":id", $id, PDO::PARAM_INT);
            $stmt->execute();
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($usuario) {
                // Cambiar el estado (0 -> 1 o 1 -> 0)
                $nuevoEstado = $usuario['estado'] == 0 ? 1 : 0;

                // Preparar la consulta para actualizar el estado del usuario
                $sql = "UPDATE usuarios SET estado = :estado WHERE ID_Usuario = :id";
                $stmt = $conn->prepare($sql);
                $stmt->bindParam(":estado", $nuevoEstado, PDO::PARAM_INT);
                $stmt->bindParam(":id", $id, PDO::PARAM_INT);

                // Ejecutar la consulta
                if ($stmt->execute()) {
                    // Verificar si se actualizó alguna fila
                    if ($stmt->rowCount() > 0) {
                        $accion = $nuevoEstado == 1 ? "desactivado" : "activado";
                        echo json_encode(["success" => "Usuario $accion correctamente"]);
                    } else {
                        echo json_encode(["error" => "No se encontró el usuario con el ID proporcionado"]);
                    }
                } else {
                    echo json_encode(["error" => "Error al ejecutar la consulta"]);
                }
            } else {
                echo json_encode(["error" => "No se encontró el usuario con el ID proporcionado"]);
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