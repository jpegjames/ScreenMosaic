# ScreenMosaic

## NOTE
This is an ongoing project and the documentation still needs much work.
If you would like to contribute to the project or documentation, you can do
so by creating forking the code and making pull requests. If you would like
to make suggestions for the code or documentation, you could also open a new
issue on GitHub.

Also, please note that I'm a Ruby on Rails developer and this is my first
Node.js project. If you have suggestions to improve my code or make it
easier to use, I would love your feedback :)

## Basic Concept
The concept of ScreenMosaic is to use standard web technologies to display
one large image across multiple displays (such as tablets or monitors attached
to dedicated computers). The device or screen should be able to a web page at
full-screen to make use of the project.

The technology requirements for creating a ScreenMosaic are these three main components:
* a server (powered by this Node.js project)
* multiple screens (i.e. tablets, computers attached to monitors, etc)
* a network (likely Wi-Fi if using tablets)

The server’s primary purpose is to send and receive websocket commands for
real-time updating of the screens, keep track of the X and Y position of
each device, and to host the media. The server does not require a database,
but instead the positions of the devices are stored in `config/screens.json`.

In an attempt to create software that is flexible for a wide number of use cases,
this software *does not* include any functionality to trigger a change on the screens.
You will need to trigger a request in your own implementation, but examples will be
included in this repo soon.

## Launching the Server
Before starting, you will need to have Node.js installed on your machine and/or server
powering the wall.

Launch the server from your terminal shell by moving into the project's directory and
running `node ./app.js`. By default this will run on port 1234, so `127.0.0.1:1234`
when accessed locally or `[your-ip-address]:1234` when accessed by other devices on
the same network.

## Controlling the screens

### Basic Commands (applies to all screens)

#### Refresh
```javascript
socket.emit('screen instruction', 'refresh');
```

#### Mute & Unmute
```javascript
socket.emit('screen instruction', 'mute');
socket.emit('screen instruction', 'unmute');
```
> NOTE: This mutes and unmutes the screen and audio. When muted, the screen will be black.
> Changes can still happen while muted and will be shown once unmuted .

#### Display IDs and Tokens
```javascript
socket.emit('screen instruction', 'show-token');
socket.emit('screen instruction', 'hide-token');
```

#### Grid
```javascript
socket.emit('screen grid', true);
socket.emit('screen grid', false);
````
> TODO: `screen grid` uses a different syntax structure than the other commands above. This 
should be updated in the future. 


#### Move
```javascript
socket.emit('screen instruction', {
    token: 'tokenString',
    top: '-100px',
    left: '-50px',
    scale: 1
});
```

> NOTE: the `top`, `left` and `scale` parameters are CSS values that offsets the **grid** only. Because it is an offset, negative pixel values should be sent. This is used by the `/setup` page.


### Multimedia Commands

#### Images

Sends the same image to all of the screens. The individual screens will handle the offset:
```javascript
socket.emit('screen image', '/path/to/file.jpg');

// alternatively:
socket.emit('screen image', {'all': '/path/to/file.jpg'});
```

Sends a preprocessed image to each screen (see below):
```javascript
socket.emit('screen image', {
    'preprocessed': '/path/to/file.jpg'
});
```


Clear all images:
```javascript
socket.emit('screen image', null);
```

Send an image to specific screens:
```javascript
socket.emit('screen image', {
    10: '/path/to/file-10.jpg',
    11: '/path/to/file-11.jpg',
    12: '/path/to/file-12.jpg',
    13: '/path/to/file-13.jpg',
});
```

Combining:
```javascript
socket.emit('screen image', {
    'preprocessed': '/path/to/file.jpg',
    55: '/path/to/animation.gif'
});
```


#### Colors
```javascript
// Set all screens to red:
socket.emit('screen color', '#FF0000'); 

// Set all screens to a random color:
var randomColor = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
socket.emit('screen color', randomColor);
```


#### Video
Sends the same video to all screens:
```javascript
socket.emit('screen video', 'path/to/video.mp4');
```

Sends a same video to a specific screens:
```javascript
socket.emit('screen video', {
    12: 'path/to/video.mp4'
});
```

Commands:
``` javascript
socket.emit('screen video', 'play');
socket.emit('screen video', 'pause');
socket.emit('screen video', 'rewind');
socket.emit('screen video', 'stop');
socket.emit('screen video', 'loop');
socket.emit('screen video', 'unloop');
socket.emit('screen video', 'showControls');
socket.emit('screen video', 'hideControls');
```


#### Audio
```javascript
socket.emit('screen audio', {10: '/tv-static-05.mp3'});
```
> NOTE: Newer devices typically do not allow unmuted audio or video without first interacting
with the web page. This feature will not work on every device. 


#### iFrame
```javascript
socket.emit('screen iframe', 'path-to-iframe.html');

socket.emit('screen iframe', {
    11: 'path/to/iframe.html',
    12: 'path/to/iframe2.html'
});
```


## Screens Setup
Start by arranging multiple screens and accessing the server from a web browser on
the devices at `http://[your-ip-address]:1234/`.

The first time you open the web page, you will get a message that the screen is not
defined in `screens.json`. You will need to add that screen using the token generated
in the browser (see below).

Once a screen is defined, you can access `http://[your-ip-address]:1234/setup` from
any computer on the same network to help position the screens correctly in `screens.json`.

## screens.json
This configuration file is required by the server to know where each screen is in
relation to each other in the overall mosaic. The screens are stored in an array,
and must have the following key/values for each screen:
* id
* token
* top
* left

Additionally, you will need to specify the following if you would like the server
to preprocess (crop) the images ahead of time:
* width
* height

**id**: [integer || string] The id is a value that you assign and should be unique.
It can be any alphanumeric value, but an integer may be the most common value.

**token**: [string] The token is generated by the web server for each browser session
and is stored as a cookie on the device. This is the primary way that the server
associates a screen in `screens.json` to the device.

**top**: [integer] This value is the offset in pixels of the specific screen from the
top. This value should be a positive value or else an image will not display fully or
at all on the device.

**left**: [integer] This value is the offset in pixels of the specific screen from the
left. This value should be a positive value or else an image will not display fully or
at all on the device.

**width**: [integer] Optional. This value is used when the server crops an image
with the preprocess feature. This will be the resulting size of the cropped image
and should be equal to the width (in pixels) of the screen.

**height**: [integer] Optional. This value is used when the server crops an image
with the preprocess feature. This will be the resulting size of the cropped image
and should be equal to the height (in pixels) of the screen.

## Endpoints

### Web endpoints
`/` The root URL is the primary path used by all of the screens. By default, this
path will use the generated token to reference the settings in `screens.json` but
you can also point to a specific screen config by using `/?id=[value]` in the browser.

`/preview` This is an experimental  

`/setup` This page provides some basic controls for the screen. It also provides controls
to set and test the screen positions within the Mosaic. This is useful for the intial setup
and the data can be saved to `screens.json`.


##
The server software also has a few tools to help align each screen in the overall grid and to crop the images for the screens.

## Preprocessing

The webserver can attempt to send one large image to all of the screens and offset each
image using CSS. This works fine with smaller mosaics, but it can be problematic for larger
setups because of the filesize required for one large image.

Preprocessing the will splice the large image into individual images for each screen
based on the data found in `screens.json`. If you send a command to display a preprocessed
image, the server will automatically send the correct spliced image to each screen. 

Run from command line:  
`node resize.js [image]`

> NOTE: The image is assumed to be in `/public/images`.   
> This function will accept `/public/images` in the provided path which is useful for path hints within terminal.

JPEG and PNG files are recommended. This script should handle any file supported by ImageMagick and graphicsmagick 
but it is recommended to use web friendly files. The script will not convert an image to a different format.

### Examples

`node resize.js graphic1.jpg`  
Will splice public/images/graphic1.jpg into multiple images as defined
by the `screens.json` file.

`node resize.js public/images/graphic1.jpg`  
Will will work the same as above.

### Caveats
This is not an automatic proccess. If `screens.json` is changed, the images will need to be 
reprocessed. The server does not keep track of these changes.

If the image has not been preproccessed and a command for a preprocessed image is sent,
the screens will attempt to display a file that is not found (404 error). The result will be
that the screens show the background color (default is black). 

## Full Screen

To simplify the setup process, each tablet loads the same URL hosted from the Node.js server, but each device generates a unique token that is stored as a cookie on the device (fig. 15). This allows the server to know where this screen is located within the X/Y grid and handle the media appropriately. This technique is similar in concept to how visitors to a website can get targeted ads specific to the user, even though every user is visiting the same page.
