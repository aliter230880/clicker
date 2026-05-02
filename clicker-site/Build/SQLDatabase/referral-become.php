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
    $code = $_POST["code"];

    $namecheck = $db->select("tg_referrals", array("telegram", "code", "referral"), array("telegram"), array($telegram));

    $check = $db->select("tg_referrals", array("telegram", "code", "referral"), array("code"), array($code));
    $info = mysqli_fetch_assoc($check);

    if (mysqli_num_rows($namecheck) != 1)
    {
        echo new Result(false, "Incorrect username");
        return;
    }
    else
    {
        $existinginfo = mysqli_fetch_assoc($namecheck);
        if (mysqli_num_rows($check) == 0 || $info["telegram"] === $telegram || ($info["referral"] != null && trim($info["referral"]) != '' && $info["referral"] === $existinginfo["code"]))
        {
            echo new Result(false, "Error");
            return;
        }
        else if ($existinginfo["referral"] === null || trim($existinginfo["referral"]) === '')
        {
            $insertuserquery = "UPDATE tg_referrals SET referral = '" . $code . "' WHERE telegram = '" . $telegram . "';";
            mysqli_query($db->con, $insertuserquery);

            $namecheck = $db->check("tg_referrals", "referral", $code);
            $referralsCount = mysqli_num_rows($namecheck);

            $reward = 0;
            if ($referralsCount == 1)
                $reward = 50000;
            else if ($referralsCount == 3)
                $reward = 200000;
            else if ($referralsCount == 5)
                $reward = 350000;

            if ($reward > 0)
            {
                $namecheck = $db->select("tg_clicker", array("telegram", "score"), array("telegram"), array($info["telegram"]));
                $existinginfo = mysqli_fetch_assoc($namecheck);

                $insertuserquery = "UPDATE tg_clicker SET score = '" . ($existinginfo["score"] + $reward) . "' WHERE telegram = '" . $info["telegram"] . "';";
                mysqli_query($db->con, $insertuserquery);
            }
        }
        else
        {
            echo new Result(false, "User already has a referral");
            return;
        }
    }

    echo new Result(true, $code);

?>