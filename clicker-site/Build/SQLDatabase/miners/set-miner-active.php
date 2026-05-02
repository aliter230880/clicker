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
$minerId = $_POST["minerId"];
$minerIndex = intval($_POST["minerIndex"]);
$active = boolval($_POST["active"]);

$namecheck = $db->select("tg_miners", array("wallet_address", "miners"), array("wallet_address"), array($walletAddress));

$miners = [];
if (mysqli_num_rows($namecheck) > 1)
{
    echo new Result(false, "Incorrect wallet");
    return;
}
else if (mysqli_num_rows($namecheck) === 0)
{
    $minersArray = [];
    for ($i = 0; $i < $minerIndex + 1; $i++)
    {
        array_push($minersArray, [
            "isActive" => $i === $minerIndex ? $active : false,
            "lastTimeReset" => (new DateTime())->format('Y-m-d H:i:s')
        ]);
    }
    $miners = array(
        [
            "tokenId" => $minerId,
            "miners" => $minersArray
        ]
    );
    $db->insert("tg_miners", array("wallet_address", "miners"), array($walletAddress, json_encode($miners)));
}
else
{
    $existinginfo = mysqli_fetch_assoc($namecheck);
    $miners = json_decode($existinginfo["miners"], true);
    $foundedMinerIndex = -1;
    for ($i = 0; $i < count($miners); $i++)
    {
        if ($miners[$i]["tokenId"] === $minerId)
        {
            $foundedMinerIndex = $i;
            break;
        }
    }
    if ($foundedMinerIndex === -1)
    {
        $minersArray = [];
        for ($i = 0; $i < $minerIndex + 1; $i++)
        {
            array_push($minersArray, [
                "isActive" => $i === $minerIndex ? $active : false,
                "lastTimeReset" => (new DateTime())->format('Y-m-d H:i:s')
            ]);
        }
        array_push($miners, [
            "tokenId" => $minerId,
            "miners" => $minersArray
        ]);
    }
    else
    {
        $minersArray = $miners[$foundedMinerIndex]["miners"];
        $minersCount = count($minersArray);
        if ($minersCount <= $minerIndex)
        {
            for ($i = $minersCount; $i < $minerIndex + 1; $i++)
            {
                array_push($miners[$foundedMinerIndex]["miners"], [
                    "isActive" => $i === $minerIndex ? $active : false,
                    "lastTimeReset" => (new DateTime())->format('Y-m-d H:i:s')
                ]);
            }
        }
        else
        {
            $miners[$foundedMinerIndex]["miners"][$minerIndex] = [
                "isActive" => $active,
                "lastTimeReset" => (new DateTime())->format('Y-m-d H:i:s')
            ];
        }
    }
    $insertuserquery = "UPDATE tg_miners SET miners = '" . json_encode($miners) . "' WHERE wallet_address = '" . $walletAddress . "';";
    mysqli_query($db->con, $insertuserquery);
}

$result = [
    "isActive" => $active,
    "lastTimeReset" => (new DateTime())->format('Y-m-d H:i:s')
];

echo new Result(true, json_encode($result));

?>