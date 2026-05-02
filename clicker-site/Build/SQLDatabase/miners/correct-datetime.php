<?php

include "../main.php";

$dateTime = $_POST["dateTime"];

$nowStr = (new DateTime())->format('Y-m-d H:i:s');
$now = strtotime($nowStr);
$post = strtotime($dateTime);
$timespan = $now - $post;

echo new Result(true, strval($timespan));

?>