<?php

include "../main.php";
include "miners-config.php";

echo new Result(true, json_encode(MINERS_CONFIG));

?>