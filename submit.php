<?php
$servername = "localhost";
$username = "root";
$password = "hellothere";
$dbname = "user_activity";

try {
    $data = json_decode(file_get_contents("php://input"));
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);

    $fp = fopen('results.txt', 'a');
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $loadt = $data->loadTime;
    $unloadt = $data->unloadTime;

    $sqlins = 'INSERT INTO user_sessions (
        userid, language, platform,
        loadTime, unloadTime,
        port, endpoint,
        page_location, page_href, page_origin, page_title,
        clientStart_name,
        clientStart_innerWidth, clientStart_innerHeight,
        clientStart_outerWidth, clientStart_outerHeight,
        clientEnd_name,
        clientEnd_innerWidth, clientEnd_innerHeight,
        clientEnd_outerWidth, clientEnd_outerHeight
    )
    VALUES (
        "'.$data->user.'",
        "'.$data->language.'",
        "'.$data->platform.'",
        STR_TO_DATE("'.$loadt.'","%Y-%m-%dT%H:%i:%s"),
        STR_TO_DATE("'.$unloadt.'","%Y-%m-%dT%H:%i:%s"),
        '.(int)$data->port.',
        "'.$data->endpoint.'",
        "'.$data->page->location.'",
        "'.$data->page->href.'",
        "'.$data->page->origin.'",
        "'.$data->page->title.'",
        "'.$data->clientStart->name.'",
        '.(int)$data->clientStart->innerWidth.',
        '.(int)$data->clientStart->innerHeight.',
        '.(int)$data->clientStart->outerWidth.',
        '.(int)$data->clientStart->outerHeight.',
        "'.$data->clientEnd->name.'",
        '.(int)$data->clientEnd->innerWidth.',
        '.(int)$data->clientEnd->innerHeight.',
        '.(int)$data->clientEnd->outerWidth.',
        '.(int)$data->clientEnd->outerHeight.'
    )';
    $sqlstate = $conn->prepare($sqlins);
    $sqlstate->execute();
    $last_id = $conn->lastInsertId();

    $conn->beginTransaction();
    foreach($data->interactions as $x) {
        $created = $x->createdAt;
        $sqlins = 'INSERT INTO interactions (
            sessionid, userid, 
            type, event, 
            targetTag, targetClasses,
            Content, 
            clientPosition_x,
            clientPosition_y,
            screenPosition_x,
            screenPosition_y,
            createdAt
        )
        VALUES (
            '.$last_id.',
            "'.$data->user.'",
            "'.$x->type.'",
            "'.$x->event.'",
            "'.$x->targetTag.'",
            "'.$x->targetClasses.'",
            "'.$x->content.'",
            '.(int)$x->clientPosition->x.',
            '.(int)$x->clientPosition->y.',
            '.(int)$x->screenPosition->x.',
            '.(int)$x->screenPosition->y.',
            STR_TO_DATE("'.$created.'","%Y-%m-%dT%H:%i:%s")
        )';
        $conn->exec($sqlins);
    }
    $conn->commit();
    fclose($fp);

} catch (PDOException $e) {
    $fp = fopen('results.txt', 'a');
    fwrite($fp, $e);
    fclose($fp);
}

$conn = null;
