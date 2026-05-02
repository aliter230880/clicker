<?php

include "../main.php";

$db = new Database();
$res = $db->connectToDatabase();
if ($res->success == false)
{
    echo $res;
    return;
}

$walletAddress = $_POST["walletAddress"];

$namecheck = $db->select("tg_miners", array("wallet_address", "miners"), array("wallet_address"), array($walletAddress));

if (mysqli_num_rows($namecheck) != 1)
{
    echo new Result(false, "Incorrect wallet");
    return;
}

$existinginfo = mysqli_fetch_assoc($namecheck);

$miners = $existinginfo["miners"];

echo new Result(true, $miners);

?>