<?php

require_once('boot.php');

$params = json_decode(file_get_contents('php://input'));
$types = explode(',', $params->shopType);
$session->addEvent(Session::Event_addShop, $types);

$session->flush();

$response = [
	"status" => "ok",
	"session" => $_SESSION,
];

echo json_encode($response);