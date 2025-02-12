<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

session_start();
session_unset();
session_destroy();

echo json_encode(["status" => "success", "message" => "Sesión cerrada exitosamente."]);
?>