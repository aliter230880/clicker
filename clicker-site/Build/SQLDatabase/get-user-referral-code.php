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

$namecheck = $db->select("tg_referrals", array("telegram", "code"), array("telegram"), array($telegram));

$code = "";
if (mysqli_num_rows($namecheck) == 0)
{
    $tgcheck = $db->check("tg_clicker", "telegram", $telegram);
    if (mysqli_num_rows($tgcheck) != 1)
    {
        echo new Result(false, "Incorrect telegram");
        return;
    }
    else
    {
        $code = generateRandomString();
        for ($i = 0; $i < 10; $i++)
        {
            $check = $db->check("tg_referrals", "code", $code);
            if (mysqli_num_rows($check) > 0)
            {
                if ($i >= 9)
                {
                    echo new Result(false, "Referral code generate error");
                    return;
                }
                $code = generateRandomString();
            }
            else
            {
                break;
            }
        }
        $db->insert("tg_referrals", array("telegram", "code", "referral"), array($telegram, $code, ""));
    }
}
else if (mysqli_num_rows($namecheck) == 1)
{
    $existinginfo = mysqli_fetch_assoc($namecheck);
    $code = $existinginfo["code"];
}
else
{
    echo new Result(false, "Incorrect telegram");
    return;
}

echo new Result(true, $code);

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