<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json; charset=UTF-8");

include 'conexionBD.php';

try {

    $sql = "SELECT ID_Usuario, nombre, apellido1, apellido2, email, Rol, FechaCreacion, estado FROM Usuarios";
    $result = $conn->query($sql);
    $usuarios = [];
    if ($result->rowCount() > 0) { 
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) { 
            $usuarios[] = $row;
        }
    }
    echo json_encode($usuarios);
} catch (PDOException $e) {
    echo json_encode(["error" => "Error en la consulta: " . $e->getMessage()]);
} finally {
    $conn = null;
}
?>