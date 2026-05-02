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
$referral = $_POST["referral"];

$namecheck = $db->check("tg_clicker", "telegram", $telegram);

if (mysqli_num_rows($namecheck) == 0)
{
    $db->insert("tg_clicker", array("telegram", "score"), array($telegram, 0));
}

$namecheck = $db->check("tg_referrals", "telegram", $telegram);

$referralCode = generateRandomString();
for ($i = 0; $i < 10; $i++)
{
    $check = $db->check("tg_referrals", "code", $referralCode);
    if (mysqli_num_rows($check) > 0)
    {
        if ($i >= 9)
        {
            echo new Result(false, "Referral code generate error");
            return;
        }
        $referralCode = generateRandomString();
    }
    else
    {
        break;
    }
}
if (mysqli_num_rows($namecheck) == 0)
{
    $db->insert("tg_referrals", array("telegram", "code", "referral"), array($telegram, $referralCode, $referral));
}
else
{
    $namecheck = $db->select("tg_referrals", array("telegram", "code"), array("telegram"), array($telegram));
    $existinginfo = mysqli_fetch_assoc($namecheck);
    $referralCode = $existinginfo["code"];
}

echo new Result(true, $referralCode);

function generateRandomString($length = 10) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';

    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[random_int(0, $charactersLength - 1)];
    }

    return $randomString;
}

?>