<?php

require_once('boot.php');

$session->addEvent(Session::Event_restart);

$response = [
	"status" => "ok",
];

$session->flush();

echo json_encode($response);