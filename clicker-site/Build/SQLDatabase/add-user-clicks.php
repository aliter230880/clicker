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
$clicksCount = $_POST["clicksCount"];

$namecheck = $db->select("tg_clicker", array("telegram", "score"), array("telegram"), array($telegram));

if (mysqli_num_rows($namecheck) > 1)
{
    echo new Result(false, "Incorrect username");
    return;
}

$result = 0;
if (mysqli_num_rows($namecheck) === 0)
{
    $result = $clicksCount;
    $db->insert("tg_clicker", array("telegram", "score"), array($telegram, $clicksCount));
}
else
{
    $existinginfo = mysqli_fetch_assoc($namecheck);
    $newScore = $existinginfo["score"] + $clicksCount;
    $result = $newScore;
    $insertuserquery = "UPDATE tg_clicker SET score = '" . $newScore . "' WHERE telegram = '" . $telegram . "';";
    mysqli_query($db->con, $insertuserquery);
}

echo new Result(true, $result);

?>