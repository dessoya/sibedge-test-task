<?php

require_once('boot.php');

$session->treatEntities();

$response = [
	"status" => "ok",

	"events" => $session->getEvents(),
];

$session->deleteEvents();

$session->flush();

echo json_encode($response);