<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");


include 'conexionBD.php';


if (isset($_GET["id"]) && !empty($_GET["id"])) {
    $id = intval($_GET["id"]); 

    if ($id > 0) {
        try {
           
            $sql = "SELECT ID_Usuario, nombre, apellido1, apellido2, email, Rol, FechaCreacion FROM usuarios WHERE ID_Usuario = :id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":id", $id, PDO::PARAM_INT);
            $stmt->execute();

            
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
              
                echo json_encode($user);
            } else {
                
                echo json_encode(["error" => "No se encontró el usuario con el ID proporcionado"]);
            }
        } catch (PDOException $e) {
            
            echo json_encode(["error" => "Error en la base de datos: " . $e->getMessage()]);
        }
    } else {
        
        echo json_encode(["error" => "ID inválido"]);
    }
} else {
   
    echo json_encode(["error" => "Parámetro 'id' no proporcionado"]);
}

$conn = null;
?>