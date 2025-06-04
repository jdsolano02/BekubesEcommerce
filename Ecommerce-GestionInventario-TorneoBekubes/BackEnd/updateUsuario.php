<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include 'conexionBD.php';

$data = json_decode(file_get_contents("php://input"), true);


if (isset($data["ID_Usuario"]) && !empty($data["ID_Usuario"])) {
    $id = intval($data["ID_Usuario"]);
    $nombre = $data["nombre"];
    $apellido1 = $data["apellido1"];
    $apellido2 = $data["apellido2"];
    $email = $data["email"];
    $Rol = $data["Rol"];
    $telefono = $data["telefono"];
    $direccion = $data["direccion"];

    try {
        $sql = "UPDATE usuarios SET nombre = :nombre, apellido1 = :apellido1, apellido2 = :apellido2, email = :email, Rol = :Rol, telefono = :telefono, direccion= :direccion WHERE ID_Usuario = :id";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(":nombre", $nombre);
        $stmt->bindParam(":apellido1", $apellido1);
        $stmt->bindParam(":apellido2", $apellido2);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":Rol", $Rol);
        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":telefono", $telefono);
        $stmt->bindParam(":direccion", $direccion);

        if ($stmt->execute()) {
            if ($stmt->rowCount() > 0) {
                echo json_encode(["success" => "Usuario actualizado correctamente"]);
            } else {
                echo json_encode(["error" => "No se encontró el usuario con el ID proporcionado"]);
            }
        } else {
            echo json_encode(["error" => "Error al ejecutar la consulta"]);
        }
    } catch (PDOException $e) {
        echo json_encode(["error" => "Error en la base de datos: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["error" => "ID inválido o datos incompletos"]);
}
$conn = null;
?>