<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include 'conexionBD.php';

$data = json_decode(file_get_contents("php://input"));

if (
    !isset($data->idUsuario) ||
    !isset($data->nombre) ||
    !isset($data->apellido1) ||
    !isset($data->apellido2)
) {
    echo json_encode(["status" => "error", "message" => "Datos incompletos."]);
    exit;
}

try {
    $query = "UPDATE usuarios SET 
                nombre = :nombre, 
                apellido1 = :apellido1, 
                apellido2 = :apellido2, 
                Telefono = :telefono, 
                Direccion = :direccion 
              WHERE ID_Usuario = :idUsuario";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(":nombre", $data->nombre);
    $stmt->bindParam(":apellido1", $data->apellido1);
    $stmt->bindParam(":apellido2", $data->apellido2);
    $stmt->bindParam(":telefono", $data->Telefono);
    $stmt->bindParam(":direccion", $data->Direccion);
    $stmt->bindParam(":idUsuario", $data->idUsuario);

    $stmt->execute();

    echo json_encode(["status" => "success", "message" => "Usuario actualizado correctamente."]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
