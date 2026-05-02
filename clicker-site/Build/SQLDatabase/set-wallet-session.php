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
$walletSession = $_POST["walletSession"];

$namecheck = $db->select("tg_clicker", array("telegram", "lastWalletSession"), array("telegram"), array($telegram));

if (mysqli_num_rows($namecheck) != 1)
{
    echo new Result(false, "Incorrect telegram");
    return;
}

$obj = json_encode($walletSession);

$insertuserquery = "UPDATE tg_clicker SET lastWalletSession = " . $obj . " WHERE telegram = '" . $telegram . "';";
mysqli_query($db->con, $insertuserquery);

echo new Result(true, "");

?>