<?php

include "../main.php";
include "miners-config.php";

$db = new Database();
$res = $db->connectToDatabase();
if ($res->success == false)
{
    echo $res;
    return;
}

$telegram = $_POST["telegram"];
$walletAddress = $_POST["walletAddress"];
$nftMiners = $_POST["nftMiners"];

$nftMiners = json_decode($nftMiners, true);

$tgcheck = $db->select("tg_clicker", array("telegram", "score"), array("telegram"), array($telegram));
$walletcheck = $db->select("tg_miners", array("wallet_address", "miners"), array("wallet_address"), array($walletAddress));

if (mysqli_num_rows($tgcheck) != 1 || mysqli_num_rows($walletcheck) != 1)
{
    echo new Result(false, "Incorrect telegram or wallet");
    return;
}

$tginfo = mysqli_fetch_assoc($tgcheck);
$score = $tginfo["score"];

$walletinfo = mysqli_fetch_assoc($walletcheck);
$miners = json_decode($walletinfo["miners"], true);

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

$miningScore = 0;

for ($i = 0; $i < count($miners); $i++)
{
    $foundedMinerStatsIndex = -1;
    for ($j = 0; $j < count(MINERS_CONFIG["minersStats"]); $j++)
    {
        if (MINERS_CONFIG["minersStats"][$j]["tokenId"] === $miners[$i]["tokenId"])
        {
            $foundedMinerStatsIndex = $j;
            break;
        }
    }
    if ($foundedMinerStatsIndex === -1)
        continue;
    for ($j = 0; $j < count($miners[$i]["miners"]); $j++)
    {
        if ($miners[$i]["miners"][$j]["isActive"] != '1')
            continue;
        $lastTimeReset = strtotime($miners[$i]["miners"][$j]["lastTimeReset"]);
        $nowTime = strtotime("now");
        $plusScore = floor(MINERS_CONFIG["minersStats"][$foundedMinerStatsIndex]["gemsPerDay"] * (($nowTime - $lastTimeReset) / (60 * 60 * 24)));
        $miningScore += $plusScore;
        $miners[$i]["miners"][$j] = [
            "isActive" => $miners[$i]["miners"][$j]["isActive"],
            "lastTimeReset" => (new DateTime())->format('Y-m-d H:i:s')
        ];
    }
}

$insertuserquery = "UPDATE tg_miners SET miners = '" . json_encode($miners) . "' WHERE wallet_address = '" . $walletAddress . "';";
mysqli_query($db->con, $insertuserquery);

$insertuserquery = "UPDATE tg_clicker SET score = '" . ($score + $miningScore) . "' WHERE telegram = '" . $telegram . "';";
mysqli_query($db->con, $insertuserquery);

echo new Result(true, $miningScore);

?>