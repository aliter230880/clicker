<?php

    include "main.php";

    $db = new Database();
    $res = $db->connectToDatabase();
    if ($res->success == false)
    {
        echo $res;
        return;
    }

    $code = $_POST["code"];

    $namecheck = $db->check("tg_referrals", "referral", $code);

    echo new Result(true, strval(mysqli_num_rows($namecheck)));

?>