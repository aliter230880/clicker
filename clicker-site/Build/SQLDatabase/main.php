<?php

class Result{
    public bool $success = false;
    public string $text = "";
    function __construct(bool $success, string $text) {
        $this->success = $success;
        $this->text = $text;
    }
    function __toString(){
        $result = [
            "success" => $this->success,
            "text" => $this->text,
        ];
        return json_encode($result);
    }
}

class Database{
    public $con;
    public $user;
    function __construct() {
        
    }
    function connectToDatabase(){
        include "config.php";
        $this->con = mysqli_connect($db_connect, $db_user, $db_password, $db_name);
    
        if (mysqli_connect_errno())
        {
            return new Result(false, "Conection to database failed!");
        }
        return new Result(true, "");
    }
    function userInit(string $paramName, string $paramValue){
        $check = $this->select("players", array("username", "hash", "salt", "metamask", "telegram", "avatar", "user_icon", "save_data"), array($paramName), array($paramValue));
        if (mysqli_num_rows($check) != 1)
        {
            return new Result(false, "Incorrect " . $paramName);
        }
        else
        {
            $this->user = mysqli_fetch_assoc($check);
            return new Result(true, "");
        }
    }
    function getUserJson(){
        $username = $this->user["username"];
        $hash = $this->user["hash"];
        $metamask = $this->user["metamask"];
        $telegram = $this->user["telegram"];
        $avatar = $this->user["avatar"];
        $userIcon = $this->user["user_icon"];
        $saveData = $this->user["save_data"];

        if($username === null) $username = "";
        if($metamask === null) $metamask = "";
        if($telegram === null) $telegram = "";
        if($avatar === null) $avatar = "";
        if($userIcon === null) $userIcon = "";
        if($saveData === null) $saveData = "";

        return $this->userJson(
            $username,
            $hash !== null && trim($hash) !== '',
            $metamask,
            $telegram,
            $avatar,
            $userIcon,
            $saveData
        );
    }
    function userJson(string $username, bool $password, string $metamask, string $telegram, string $avatar, string $userIcon, string $saveData){
        $userJson = [
            "username" => $username,
            "password" => $password,
            "metamask" => $metamask,
            "telegram" => $telegram,
            "avatar" => $avatar,
            "userIcon" => $userIcon,
            "saveData" => $saveData,
        ];
        return json_encode($userJson);
    }
    function check(string $table, string $name, string $value){
        $checkquery = "SELECT " . $name . " FROM " . $table . " WHERE " . $name . "='" . $value . "';";
        return mysqli_query($this->con, $checkquery);
    }
    function select(string $table, array $returnParams, array $paramsNames, array $paramsValues){
        $query = "SELECT ";
        for ($i = 0; $i < count($returnParams); $i++) {
            $query .= $returnParams[$i];
            if ($i < count($returnParams) - 1)
                $query .= ", ";
        }
        $query .= " FROM " . $table . " WHERE ";
        for ($i = 0; $i < count($paramsNames); $i++) {
            $query .= $paramsNames[$i] . "='" . $paramsValues[$i] . "'";
            if ($i < count($paramsNames) - 1)
                $query .= ", ";
        }
        $query .= ";";
        return mysqli_query($this->con, $query);
    }
    function insert(string $table, array $paramsNames, array $paramsValues){
        $query = "INSERT INTO " . $table . " (";
        for ($i = 0; $i < count($paramsNames); $i++) {
            $query .= $paramsNames[$i];
            if ($i < count($paramsNames) - 1)
                $query .= ", ";
        }
        $query .= ") VALUES (";
        for ($i = 0; $i < count($paramsValues); $i++) {
            $query .= "'" . $paramsValues[$i] . "'";
            if ($i < count($paramsValues) - 1)
                $query .= ", ";
        }
        $query .= ");";
        return mysqli_query($this->con, $query);
    }
}

?>