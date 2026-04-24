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
$nftMiners = $_POST["nftMiners"];

$namecheck = $db->select("tg_miners", array("wallet_address", "miners"), array("wallet_address"), array($walletAddress));

if (mysqli_num_rows($namecheck) > 1)
{
    echo new Result(false, "Incorrect wallet");
    return;
}

$existinginfo = mysqli_fetch_assoc($namecheck);

$minersJson = mysqli_num_rows($namecheck) === 0 ? "[]" : $existinginfo["miners"];

if ($nftMiners === "-")
{
    echo new Result(true, $minersJson);
    return;
}

$nftMiners = json_decode($nftMiners, true);

$miners = json_decode($minersJson, true);

for ($i = 0; $i < count($miners); $i++)
{
    $foundedIndex = -1;
    for ($j = 0; $j < count($nftMiners); $j++)
    {
        if ($miners[$i]["tokenId"] === $nftMiners[$j]["tokenId"])
        {
            $foundedIndex = $j;
            break;
        }
    }
    if ($foundedIndex === -1 || $nftMiners[$foundedIndex]["count"] == 0)
    {
        array_splice($miners, $i, 1);
        $i--;
    }
    else
    {
        if ($nftMiners[$j]["count"] < count($miners[$i]["miners"]))
        {
            $count = count($miners[$i]["miners"]) - $nftMiners[$j]["count"];
            array_splice($miners[$i]["miners"], count($miners[$i]["miners"]) - $count, $count);
        }
        else if ($nftMiners[$j]["count"] > count($miners[$i]["miners"]))
        {
            $count = $nftMiners[$j]["count"] - count($miners[$i]["miners"]);
            for ($j = 0; $j < $count; $j++)
            {
                array_push($miners[$j]["miners"], [
                    "isActive" => false,
                    "lastTimeReset" => (new DateTime())->format('Y-m-d H:i:s')
                ]);
            }
        }
    }
}

for ($i = 0; $i < count($nftMiners); $i++)
{
    $foundedIndex = -1;
    for ($j = 0; $j < count($miners); $j++)
    {
        if ($miners[$j]["tokenId"] === $nftMiners[$i]["tokenId"])
        {
            $foundedIndex = $j;
            break;
        }
    }

    if($foundedIndex === -1 && $nftMiners[$i]["count"] != 0)
    {
        $minersArray = [];
        for ($j = 0; $j < $nftMiners[$i]["count"]; $j++)
        {
            array_push($minersArray, [
                "isActive" => false,
                "lastTimeReset" => (new DateTime())->format('Y-m-d H:i:s')
            ]);
        }
        array_push($miners, [
            "tokenId" => $nftMiners[$i]["tokenId"],
            "miners" => $minersArray
        ]);
    }
}

if (mysqli_num_rows($namecheck) === 0)
{
    $db->insert("tg_miners", array("wallet_address", "miners"), array($walletAddress, json_encode($miners)));
}

echo new Result(true, json_encode($miners));

?>