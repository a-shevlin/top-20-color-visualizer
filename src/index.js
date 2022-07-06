import $, { data } from 'jquery';
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

  function getUserData() {
    fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: 'Bearer ' + access_token,
      },
    })
      .then(async (response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw await response.json();
        }
      })
      .then((data) => {
        // console.log(data);
        document.getElementById('login').style.display = 'none';
        document.getElementById('loggedin').style.display = 'unset';
        mainPlaceholder.innerHTML = userProfileTemplate(data);
      })
      .catch((error) => {
        console.error(error);
        mainPlaceholder.innerHTML = errorTemplate(error.error);
      });
  }
  $('#getTopArtist').on('click', function () {
    fetch('https://api.spotify.com/v1/me/top/artists', {
      headers: {
        Authorization: 'Bearer ' + access_token,
      },
    })
      .then(async (response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw await response.json();
        }
      })
      .then((data) => {
        console.log(data);
        for (let i = 0; i < data.items.length; i++) {
          let name = data.items[i].name;
          let artist = '#' + (i + 1);
          $('#artistBody').append(
            `<tr>
            <th class="artistNumber" scope="row">${artist}</th>
            <td>${name}</td>
            <tr>`
          );
        }
      })
      .catch((error) => {
        console.error(error);
        mainPlaceholder.innerHTML = errorTemplate(error.error);
      });
  });

  $('#getTopTracks').on('click', function () {
    fetch('https://api.spotify.com/v1/me/top/tracks', {
      headers: {
        Authorization: 'Bearer ' + access_token,
      },
    })
      .then(async (response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw await response.json();
        }
      })
      .then((data) => {
        for (let i = 0; i < data.items.length; i++) {
          let p = document.createElement('p');
          p.innerText = `Your #${i + 1} track is ${data.items[i].name}`;
          $('#playlists').append(p);
        }
      })
      .catch((error) => {
        console.error(error);
        mainPlaceholder.innerHTML = errorTemplate(error.error);
      });
  });

  $('#getPlaylist').on('click', function () {
    fetch('https://api.spotify.com/v1/me/playlists', {
      headers: {
        Authorization: 'Bearer ' + access_token,
      },
    })
      .then(async (response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw await response.json();
        }
      })
      .then((data) => {
        console.log(data);
        for (let i = 0; i < data.items.length; i++) {
          let p = document.createElement('p');
          p.innerText = `Playlist${i + 1} is ${data.items[i].name}`;
          $('#playlists').append(p);
        }
      })
      .catch((error) => {
        console.error(error);
        mainPlaceholder.innerHTML = errorTemplate(error.error);
      });
  });

  function handleError(error) {
    console.error(error);
    mainPlaceholder.innerHTML = errorTemplate({
      status: error.response.status,
      message: error.error.error_description,
    });
  }

  function userProfileTemplate(data) {
    console.log(data);
    return `<h1>Logged in as ${data.display_name}</h1>
      <table>
          <tr><td>Display name</td><td>${data.display_name}</td></tr>
          <tr><td>Id</td><td>${data.id}</td></tr>
          <tr><td>Email</td><td>${data.email}</td></tr>
          <tr><td>Spotify URI</td><td><a href="${data.external_urls.spotify}">${data.external_urls.spotify}</a></td></tr>
          <tr><td>Link</td><td><a href="{{href}">${data.href}</a></td></tr>
          <tr><td>Profile Image</td><td><img src="${data.images[0].url}">${data.images[0].url}</a></td></tr>
          <tr><td>Country</td><td>${data.country}</td></tr>
      </table>`;
  }

  function oAuthTemplate(data) {
    return `<h2>oAuth info</h2>
      <table>
        <tr>
            <td>Access token</td>
            <td>${data.access_token}</td>
        </tr>
        <tr>
            <td>Refresh token</td>
            <td>${data.refresh_token}</td>
        </tr>
        <tr>
            <td>Expires at</td>
            <td>${new Date(parseInt(data.expires_at, 10)).toLocaleString()}</td>
        </tr>
      </table>`;
  }

  function errorTemplate(data) {
    return `<h2>Error info</h2>
      <table>
        <tr>
            <td>Status</td>
            <td>${data.message}</td>
        </tr>
        <tr>
            <td>Message</td>
            <td>${data.message}</td>
        </tr>
      </table>`;
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

    oauthPlaceholder.innerHTML = oAuthTemplate({
      access_token,
      refresh_token,
      expires_at,
    });

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

    oauthPlaceholder.innerHTML = oAuthTemplate({
      access_token,
      refresh_token,
      expires_at,
    });

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

// function getRandomInt(max) {
//   return Math.floor(Math.random() * max);
// }
// let randomNumber = getRandomInt(99);
// let color = "#" + data.colors[randomNumber].hex;

// $('#itemID').css("background", "linear-gradient(" + color1 + color2 + color3 + ")")
