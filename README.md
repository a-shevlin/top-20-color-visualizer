# Spotify Color 

#### A simple website that shows Spotify user's playlist, top artists, and top tracks.

#### By Alex Shevlin, Seung Lee, Caroline Cerussi, Donovan Weber, Jacob Palaoro

## Technologies Used

* _HTML_
* _CSS/Bootstrap_
* _Javascript/Jquery_
* _Markdown_
* _Node.JS_
* _See **package.json** for full list of dependencies._

## Description

This webpage allows a user to sign into spotify. Upon signing in they get the option to display their top 20 artists, tracks, and most recent playlists. Users get the option to display a visualizer from the genres generated in their top tracks.
## Setup/Installation Requirements

* _clone repo to pc_
* _`$ npm install --save-dev`_
* _`$ npm audit fix --force`_
* _go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and login to spotify_
* _click create an app and name it Spotify Color_
* _click edit settings and paste http://localhost:8080/ into Redirect URIs_
* _create .env file_
* _write without quotes "CLIENT_ID=" and paste client id from [spotify](https://developer.spotify.com/dashboard) app_
* _`$ npm run build`_
* _`$ npm run start`_

## Known Bugs

* _Not having a profile picture on Spotify account will break part of the website_
* _Not having listened to music on Spotify beforehand, at least for a day or two, will prevent Top 20 and Profile Background to not function correctly_
* _not all genres are listed, so visualizer wont always work. so you have to press visualizer multiple times to work sometimes._
* _if click playlist before top 20, sometimes top 20 will appear out of place._


## License

[GNU](/LICENSE-GNU)

Copyright (c) 2022 Alex Shevlin, Caroline Cerussi, Donovan Weber, Jacob Palaoro, Seung Lee

## Contact Information

* Alex Shevlin <alexshevlin1@gmail.com>
* Caroline Cerussi <caroceru@gmail.com>
* Donovan Weber <donovanweber03@gmail.com>
* Jacob Palaoro <jpalaoro197@gmail.com>
* Seung Lee <shl7@uw.edu>

## Special Thanks 

tobika for the Spotify PKCE example
* <https://github.com/tobika/spotify-auth-PKCE-example>
