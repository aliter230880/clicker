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

$namecheck = $db->select("tg_clicker", array("telegram", "score", "dailyRewardTime"), array("telegram"), array($telegram));

if (mysqli_num_rows($namecheck) != 1)
{
    echo new Result(false, "Incorrect telegram");
    return;
}

$existinginfo = mysqli_fetch_assoc($namecheck);

$lastTimeReset = $existinginfo["dailyRewardTime"] === null || $existinginfo["dailyRewardTime"] == '' ? 0 : strtotime($existinginfo["dailyRewardTime"]);
$nowTime = strtotime("now");
$ts = $nowTime - $lastTimeReset;
$dateTimeNow = ((new DateTime())->format('Y-m-d H:i:s'));
if ($ts < MINERS_CONFIG["dailyRewardTime"])
{
    echo new Result(false, "Daily reward isn't available now");
    return;
}
else 
{
    $insertuserquery = "UPDATE tg_clicker SET score = '" . ($existinginfo["score"] + MINERS_CONFIG["dailyReward"]) . "', dailyRewardTime = '" . $dateTimeNow . "' WHERE telegram = '" . $telegram . "';";
    mysqli_query($db->con, $insertuserquery);
}

echo new Result(true, $dateTimeNow);

?>