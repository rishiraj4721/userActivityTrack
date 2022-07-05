# User Activity Tracking 
## _By Rishi Raj_

This JavaScript library can be used to track user interaction on a webiste or webpage. This library tracks HTML button and anchor tag clicks by default. the user can also add more HTML tags or div elemenst by ID for tracking. 

## Features

- Track user interactions with webpage tags and elements
- Saves user session data and activity to MySQL database
- Identifies user using stored cookies
- Easy to add to webpages
- Easy to include more HTML tags and elements
- No visible performance decrease in loading and unloading webpages


## Tech

This tracking library uses a number of open source projects to work properly:

- [Interactor] - HTML enhanced for web apps!
- [Analytics.io] - awesome web-based text editor


And of course the library itself is open source with a [public repository][trac]
 on GitHub.

## Installation

Include the following snippet of code at the end of a webpage to be tracked.

```
<script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
<script src="<path_to_track.js>"></script>
<script type="text/javascript">
    const Analytics = _analytics.init({
        app: 'interactor',
        version: 1,
        plugins: [
            pluginTrack
        ]
    })
    Analytics.page(interactor)
    var user = Analytics.plugins.actionTrack.cookieBanner()
    var interactor = new Interactor({
        interactions: true,
        interactionElementTag: [],
        interactionElementId: [],
        interactionEvents: ['mouseup'],
        endpoint: './../submit.php',
        async: true,
        debug: true,
        userid: user
    });
    
    /* Track a page view */
    Analytics.identify(user)
    Analytics.plugins.actionTrack.getstate(interactor)
</script>
```

For tracking more HTML tags, add tag names in interactor object by...

```sh
interactionElementTag: ["<list>","<of>","<desired>","<tags>"]
```
For tracking elements by class ID, add class IDs in interactor object by...

```sh
interactionElementID: ["<list>","<of>","<desired>","<element>","<IDs>"]
```
Send all the user and activity data to server endpoint by...
```
endpoint: '<server_endpoint_path>'
```

## Using in a project
Include the _Analytics.io_ library in html
```
<script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
```
Place the **track.js** file in your project folder and include the file in the webpage html source.
```
<script src="<path_to_track.js>"></script>
```

## Sending data to server
When the the page loads, the library collects information about the user device and browser. It also identifies the user using a locally stored cookie.

The library then keeps track of all the user actions on the webpage, for example, any buttons or hyperlinks clicked. 

This data is then sent to server just before the webpage unloads where it is then stored in a database.

## Server side data storage
The included _submit.php_ server saves the received data to a MySQL database. The server connects to the database using the following credentials.
```
$servername = "localhost";
$username = "root";
$password = "hellothere";
$dbname = "user_activity";
```
The database has two tables.
### User sessions(MySQL table)
```
CREATE TABLE `user_sessions` (
  `sessionid` int NOT NULL AUTO_INCREMENT,
  `userid` varchar(45) NOT NULL,
  `language` varchar(45) DEFAULT NULL,
  `platform` text,
  `loadTime` datetime DEFAULT NULL,
  `unloadTime` datetime DEFAULT NULL,
  `port` int DEFAULT NULL,
  `endpoint` text,
  `page_location` text,
  `page_href` text,
  `page_origin` text,
  `page_title` text,
  `clientStart_name` text,
  `clientStart_innerWidth` int DEFAULT NULL,
  `clientStart_innerHeight` int DEFAULT NULL,
  `clientStart_outerWidth` int DEFAULT NULL,
  `clientStart_outerHeight` int DEFAULT NULL,
  `clientEnd_name` text,
  `clientEnd_innerWidth` int DEFAULT NULL,
  `clientEnd_innerHeight` int DEFAULT NULL,
  `clientEnd_outerWidth` int DEFAULT NULL,
  `clientEnd_outerHeight` int DEFAULT NULL,
  PRIMARY KEY (`sessionid`,`userid`),
  UNIQUE KEY `sessionid_UNIQUE` (`sessionid`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```
### Interactions(MySQL table)
```
CREATE TABLE `interactions` (
  `eventid` int NOT NULL AUTO_INCREMENT,
  `sessionid` int NOT NULL,
  `userid` varchar(45) DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `event` varchar(100) DEFAULT NULL,
  `targetTag` varchar(100) DEFAULT NULL,
  `targetClasses` varchar(100) DEFAULT NULL,
  `content` varchar(100) DEFAULT NULL,
  `clientPosition_x` int DEFAULT NULL,
  `clientPosition_y` int DEFAULT NULL,
  `screenPosition_x` int DEFAULT NULL,
  `screenPosition_y` int DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`eventid`,`sessionid`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

Data stored using MySQL insert querys

### User session data

```
$loadt = $data->loadTime;
$unloadt = $data->unloadTime;

$sqlins = 'INSERT INTO user_sessions (
    userid,
    language,
    platform,
    loadTime,
    unloadTime,
    port,
    endpoint,
    page_location,
    page_href,
    page_origin,
    page_title,
    clientStart_name,
    clientStart_innerWidth,
    clientStart_innerHeight,
    clientStart_outerWidth,
    clientStart_outerHeight,
    clientEnd_name,
    clientEnd_innerWidth,
    clientEnd_innerHeight,
    clientEnd_outerWidth,
    clientEnd_outerHeight
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
```

### User interaction/activity data

```
$last_id = $conn->lastInsertId();
$conn->beginTransaction();

foreach($data->interactions as $x) {
    $created = $x->createdAt;
    $sqlins = 'INSERT INTO interactions (
        sessionid,
        userid, 
        type,
        event, 
        targetTag,
        targetClasses,
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
```

[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)

   [trac]: <https://github.com/rishiraj4721/userActivityTrack>
   [git-repo-url]: <https://github.com/rishiraj4721/userActivityTrack.git>
   [Interactor]: <https://github.com/greenstick/interactor>
   [Analytics.io]: <https://github.com/davidwells/analytics>