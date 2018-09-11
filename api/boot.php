<?php

session_start();

spl_autoload_register(function ($class) {
    include  '../Class/' . $class . '.php';
});

$session = new Session();
