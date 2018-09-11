<?php

require_once('boot.php');

$params = json_decode(file_get_contents('php://input'));
$shopId = intval($params->shopId);
$session->addEvent(Session::Event_delShop, $shopId);

$response = [
	"status" => "ok",
];

$session->flush();

echo json_encode($response);