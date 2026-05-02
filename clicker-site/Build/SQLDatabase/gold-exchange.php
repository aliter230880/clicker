<?php

include "main.php";
include "miners/miners-config.php";

$db = new Database();
$res = $db->connectToDatabase();
if ($res->success == false)
{
    echo $res;
    return;
}

$telegram = $_POST["telegram"];
$amount = $_POST["value"];

$amount = floor($amount / MINERS_CONFIG["exchangeGemsPerGold"]) * MINERS_CONFIG["exchangeGemsPerGold"];

$playerscheck = $db->select("players", array("username", "gold"), array("telegram"), array($telegram));
$clickercheck = $db->select("tg_clicker", array("telegram", "score"), array("telegram"), array($telegram));

if (mysqli_num_rows($playerscheck) != 1 || mysqli_num_rows($clickercheck) != 1)
{
    echo new Result(false, "Incorrect telegram");
    return;
}

$existinginfo = mysqli_fetch_assoc($clickercheck);

$currentScore = $existinginfo["score"];

if ($currentScore < $amount)
{
    echo new Result(false, "Not enough balance");
    return;
}

$existinginfo = mysqli_fetch_assoc($playerscheck);

$currentGold = $existinginfo["gold"];
$newGoldAmount = $currentGold + $amount / MINERS_CONFIG["exchangeGemsPerGold"];

$insertuserquery = "UPDATE players SET gold = '" . $newGoldAmount . "' WHERE telegram = '" . $telegram . "';";
mysqli_query($db->con, $insertuserquery);

$insertuserquery = "UPDATE tg_clicker SET score = '" . ($currentScore - $amount) . "' WHERE telegram = '" . $telegram . "';";
mysqli_query($db->con, $insertuserquery);

echo new Result(true, "");

?>