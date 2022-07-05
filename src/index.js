import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/styles.css';
import SpotifyService from './js/app.js';

// User Interface Logic

$(function() {
  // stuff here happens when document loads
  getSpotifyStuff();


});

async function getSpotifyStuff() {
  let spotifyApi = await SpotifyService.getSpotifyAPI();

  spotifyApi.getAlbum('5U4W9E5WsYb2jUQWePT8Xm').then(
    function(response) {
      console.log(response.body);
    },
    function(error) {
      console.log(error);
    }
  );
}