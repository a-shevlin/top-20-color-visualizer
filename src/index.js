import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/styles.css';
import SpotifyService from './js/spotify-service.js';

// User Interface Logic

(function () {
  function logout() {
    localStorage.clear();
    window.location.reload();
  }

  function clearMain() {
    mainPlaceholder.innerHTML = '';
  }

  function getUserData() {
    SpotifyService.getUserData(access_token)
      .then((data) => {
        console.log(data);
        let name = data.display_name;
        // let spotifyURI = data.external_urls.spotify;
        let image = data.images[0].url;
        // let country = data.country;
        $('#login').hide();
        $('#loggedin').show();
        $('#main').prepend(`
          <div class="jumbotron-fluid">
            <h1>Welcome ${name}<image id="profileImage" src="${image}"></h1>
          </div>
          `);
      })
      .catch((error) => {
        clearMain();
        console.error(error);
        mainPlaceholder.innerHTML = errorTemplate('Error Getting User Data');
      });
  }
  $('#getTopArtist').on('click', function () {
    SpotifyService.getTopArtist(access_token)
      .then((data) => {
        console.log(data);
        $('#artists').show();
        $('#getTopArtist').prop('disabled', true);
        $('#getTopArtist').hide();
        $('#getTopTracks').click();
        for (let i = 0; i < data.items.length; i++) {
          let name = data.items[i].name;
          let artist = '#' + (i + 1);
          let artistImg = data.items[i].images[0].url;
          $('#artistBody').append(
            `<tr id="artistName${i + 1}">
            <th class="artistNumber" scope="row">${artist}</th>
            <td class="artistName"><strong>${name}</strong></td>
            <tr>`
          );
          $(`#artistName${i + 1}`).append(
            `<td><img src="${artistImg}"></img></td>`
          );
        }
      })
      .catch((error) => {
        clearMain();
        console.error(error);
        mainPlaceholder.innerHTML = errorTemplate('Error Getting Top Artists');
      });
  });
  $('#changeBackground').on('click', function () {
    SpotifyService.getTopArtist(access_token)
      .then((data) => {
        let length = getRandomInt(20);
        console.log(length);
        let array = [];
        for (let i = 0; i < 5; i++) {
          let genres = data.items[i].genres;
          genres.forEach(element => {
            let split = element.split(" ");
            array.push(split);
          });
        }
        for (let i = 0; i < length; i++) {
          if (array[i].includes('dance') === true) {
            console.log('dance');
            $('.overlay').show();
            $('.overlay').css({
              'background-image': 'linear-gradient(-45deg, red, yellow)',
            });
          }
          else if (array[i].includes('rap') === true) {
            console.log('rap');
            $('.overlay').show();
            $('.overlay').css({
              'background-image': 'linear-gradient(blue, purple)',
            });
          }
          else if (array[i].includes('pop') === true) {
            console.log('pop');
            $('.overlay').show();
            $('.overlay').css({
              'background-image': 'linear-gradient(-45deg, rgba(255, 0, 0, 1) 0%, rgba(255, 154, 0, 1) 10%, rgba(208, 222, 33, 1) 20%, rgba(79, 220, 74, 1) 30%, rgba(63, 218, 216, 1) 40%, rgba(47, 201, 226, 1) 50%, rgba(28, 127, 238, 1) 60%, rgba(95, 21, 242, 1) 70%, rgba(186, 12, 248, 1) 80%, rgba(251, 7, 217, 1) 90%, rgba(255, 0, 0, 1) 100%)',
            });
          }
          else if (array[i].includes('emo') === true) {
            console.log('emo');
            $('.overlay').show();
            $('.overlay').css({
              'background-image': 'linear-gradient(black, white)',
            });
          }
          else if (array[i].includes('punk') === true) {
            console.log('punk');
            $('.overlay').show();
            $('.overlay').css({
              'background-image': 'linear-gradient(yellow-green, yellow)',
            });
          } else {
            $('.overlay').show();
            $('.overlay').css({
              'background-image': 'linear-gradient(dark-blue, green)',
            });
          }
        }
      })
      .catch((error) => {
        console.error(error);
      });
  });
  $('.overlay').on('click', function() {
    $('.overlay').hide();
  })
  $('#getTopTracks').on('click', function () {
    SpotifyService.getTopTracks(access_token)
      .then((data) => {
        console.log(data);
        $('#getTopTracks').prop('disabled', true);
        $('#getTopTracks').hide();
        for (let i = 0; i < data.items.length; i++) {
          let track = data.items[i].name;
          let trackBy = data.items[i].artists[0].name;
          let trackImg = data.items[i].album.images[0].url;

          $(`#artistName${i + 1}`).append(
            `<td class="trackName"id="track${
              i + 1
            }">${track} by <strong>${trackBy}</strong></td>`
          );
          $(`#artistName${i + 1}`).append(
            `<td class=""><img src="${trackImg}"></img></td>`
          );
        }
      })
      .catch((error) => {
        clearMain();
        console.error(error);
        // mainPlaceholder.innerHTML = errorTemplate(error.error);
      });
  });

  $('#getPlaylist').on('click', function () {
    SpotifyService.getPlaylist(access_token)
      .then((data) => {
        // console.log(data);
        $('#playlistTable').show();
        $('#getPlaylist').prop('disabled', true);
        $('#getPlaylist').hide();
        for (let i = 0; i < data.items.length; i++) {
          let playlist = data.items[i].name;
          let id = data.items[i].id;
          let number = '# ' + (i + 1);
          let url = data.items[i].external_urls.spotify;
          $('#playlistBody').append(
            `<tr id="playlistName${i + 1}">
              <th class="playlistNumber" scope="row">${number}</th>
              <td class="userPlaylists" id="${id}"><a href="${url}" target="_blank"><strong>${playlist}</strong></a></td>
            <tr>`
          );
        }
      })
      .catch((error) => {
        clearMain();
        console.error(error);
      });
  });

  $('#playlistBody').on('click', 'td', function () {
    const id = this.id;
    $('#tracklistBody').html('');
    SpotifyService.getPlaylistTracks(id, access_token)
      .then(function (response) {
        if (response instanceof Error) {
          throw Error('Error getting playlist tracks');
        }
        $('#tracklistTable').show();
        for (let i = 0; i < response.items.length; i++) {
          let trackName = response.items[i].track.name;
          let number = '# ' + (i + 1);
          let url = response.items[i].track.external_urls.spotify;
          $('#tracklistBody').append(
            `<tr id="tracklistName${i + 1}">
              <th scope="row">${number}</th>
              <td class="userPlaylists"><a href="${url}" target="_blank"><strong>${trackName}</strong></a></td>
            <tr>`
          );
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  function handleError(error) {
    console.error(error);
    mainPlaceholder.innerHTML = errorTemplate({
      status: error.response.status,
      message: error.error.error_description,
    });
  }

  function errorTemplate(data) {
    // if (!data) {
    //   return `<h2>Error info</h2>
    //   <table>
    //     <tr>
    //         <td>Status</td>
    //         <td>${data.message}</td>
    //     </tr>
    //     <tr>
    //         <td>Message</td>
    //         <td>${data.message}</td>
    //     </tr>
    //   </table>`;
    // } else {
    return `<h2>${data}</h2>`;
    // }
  }

  // Your client id from your app in the spotify dashboard:
  // https://developer.spotify.com/dashboard/applications
  const client_id = process.env.CLIENT_ID;
  // const client_secret = process.env.CLIENT_SECRET;
  // Your redirect uri
  // const redirect_uri = process.env.REDIRECT_URI;
  const redirect_uri = `http://localhost:8080/`;

  // Restore tokens from localStorage
  let access_token = localStorage.getItem('access_token') || null;
  let refresh_token = localStorage.getItem('refresh_token') || null;
  let expires_at = localStorage.getItem('expires_at') || null;

  // References for HTML rendering
  const mainPlaceholder = document.getElementById('main');
  const oauthPlaceholder = document.getElementById('oauth');

  // If the user has accepted the authorize request spotify will come back to your application with the code in the response query string
  // Example: http://127.0.0.1:8080/?code=NApCCg..BkWtQ&state=profile%2Factivity
  const args = new URLSearchParams(window.location.search);
  const code = args.get('code');

  function processTokenResponse(data) {
    console.log(data);

    let access_token = data.access_token;
    let refresh_token = data.refresh_token;

    const t = new Date();
    let expires_at = t.setSeconds(t.getSeconds() + data.expires_in);

    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('expires_at', expires_at);

    // oauthPlaceholder.innerHTML = oAuthTemplate({
    //   access_token,
    //   refresh_token,
    //   expires_at,
    // });

    window.location.reload();
    return [access_token, refresh_token, expires_at];
  }

  if (code) {
    // we have received the code from spotify and will exchange it for a access_token
    SpotifyService.exchangeToken(code, client_id, redirect_uri)
      .then(function (response) {
        if (response instanceof Error) {
          throw Error(`Exchange Token Error: ${response.message}`);
        }
        // clear search query params in the url
        window.history.replaceState({}, document.title, '/');
        processTokenResponse(response);
      })
      .catch(function (error) {
        handleError(error);
      });
  } else if (access_token && refresh_token && expires_at) {
    // we are already authorized and reload our tokens from localStorage
    document.getElementById('loggedin').style.display = 'unset';

    getUserData();
  } else {
    // we are not logged in so show the login button
    document.getElementById('login').style.display = 'unset';
  }

  $('#login-button').on('click', function () {
    SpotifyService.redirectToSpotifyAuthorizeEndpoint(client_id, redirect_uri);
  });

  $('#refresh-button').on('click', function () {
    SpotifyService.refreshToken(client_id, refresh_token)
      .then(function (response) {
        if (response instanceof Error) {
          throw Error(`Refresh Token Error: ${response.message}`);
        }
        processTokenResponse(response);
      })
      .catch(function (error) {
        handleError(error);
      });
  });

  $('#logout-button').on('click', function () {
    logout();
  });
})();

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
// let randomNumber = getRandomInt(99);
// let color = "#" + data.colors[randomNumber].hex;

// $('#itemID').css("background", "linear-gradient(" + color1 + color2 + color3 + ")")
