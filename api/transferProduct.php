<?php

require_once('boot.php');

$params = json_decode(file_get_contents('php://input'));
$shopId = intval($params->shopId);
$productId = intval($params->productId);
$session->addEvent(Session::Event_transferProduct, $shopId, $productId);

$response = [
	"status" => "ok",
];

$session->flush();

echo json_encode($response);