<?php

require_once('boot.php');

$session->treatEntities();
$session->deleteEvents();

$response = [
	"status" => "ok",

	// debug
	// "session" => $_SESSION,

	// production data
	"shopTypes" => Shops::getTypes(),
	"goods" => Goods::getList(),
	"storehouse" => $session->getStorehouse(),
	"shops" => $session->getShops(),
];

$session->flush();

echo json_encode($response);