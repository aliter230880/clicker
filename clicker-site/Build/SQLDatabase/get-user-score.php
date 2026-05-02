<?php

include "main.php";

$db = new Database();
$res = $db->connectToDatabase();
if ($res->success == false)
{
    echo $res;
    return;
}

$telegram = $_POST["telegram"];

$namecheck = $db->select("tg_clicker", array("telegram", "score"), array("telegram"), array($telegram));

if (mysqli_num_rows($namecheck) != 1)
{
    echo new Result(false, "Incorrect telegram");
    return;
}

$existinginfo = mysqli_fetch_assoc($namecheck);

$currentScore = $existinginfo["score"];

echo new Result(true, $currentScore);

?>