export default class SpotifyService {
  // sends request to spotify for login
  static redirectToSpotifyAuthorizeEndpoint(client_id, redirect_uri) {
    const codeVerifier = this.generateRandomString(64);

    this.generateCodeChallenge(codeVerifier).then((code_challenge) => {
      window.localStorage.setItem('code_verifier', codeVerifier);
      window.location = this.generateUrlWithSearchParams(
        'https://accounts.spotify.com/authorize',
        {
          response_type: 'code',
          client_id,
          scope: 'user-read-private user-read-email user-top-read',
          code_challenge_method: 'S256',
          code_challenge,
          redirect_uri,
        }
      );
    });
  }

  // returns a random string of specified length
  static generateRandomString(length) {
    let text = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  // return code challenge built from code verifier
  static async generateCodeChallenge(codeVerifier) {
    const digest = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(codeVerifier)
    );

    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  static generateUrlWithSearchParams(url, params) {
    const urlObject = new URL(url);
    urlObject.search = new URLSearchParams(params).toString();

    return urlObject.toString();
  }

  // returns access token and refresh token
  static exchangeToken(code, client_id, redirect_uri) {
    const code_verifier = localStorage.getItem('code_verifier');

    return fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: new URLSearchParams({
        client_id,
        grant_type: 'authorization_code',
        code,
        redirect_uri,
        code_verifier,
      }),
    })
      .then((data) => {
        return data.json();
      })
      .catch(function (error) {
        return Error(error);
      });
  }

  // refreshes token - used when token expires
  static refreshToken(client_id, refresh_token) {
    return fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: new URLSearchParams({
        client_id,
        grant_type: 'refresh_token',
        refresh_token,
      }),
    })
      .then(this.addThrowErrorToFetch)
      .then((data) => {
        return data.json();
      })
      .catch(function (error) {
        return Error(error);
      });
  }

  async addThrowErrorToFetch(response) {
    if (response.ok) {
      return response.json();
    } else {
      throw { response, error: await response.json() };
    }
  }

  // returns user data in JSON
  static getUserData(access_token) {
    return fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: 'Bearer ' + access_token,
      },
    })
      .then(function (response) {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json();
      })
      .catch(function (error) {
        return Error(error);
      });
  }

  // returns user's playlist in JSON
  static getPlaylist(access_token) {
    return fetch('https://api.spotify.com/v1/me/playlists', {
      headers: {
        Authorization: 'Bearer ' + access_token,
      },
    })
      .then(function (response) {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json();
      })
      .catch(function (error) {
        return Error(error);
      });
  }

  // returns tracks of playlist with playlistID in JSON
  static getPlaylistTracks(playlistID, access_token) {
    return fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
      .then(function (response) {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json();
      })
      .catch(function (error) {
        return Error(error);
      });
  }

  // returns top artists of user in JSON
  static getTopArtists(access_token) {
    return fetch('https://api.spotify.com/v1/me/top/artists', {
      headers: {
        Authorization: 'Bearer ' + access_token,
      },
    })
      .then(function (response) {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json();
      })
      .catch(function (error) {
        return Error(error);
      });
  }

  // returns top tracks of the user in JSON
  static getTopTracks(access_token) {
    return fetch('https://api.spotify.com/v1/me/top/tracks', {
      headers: {
        Authorization: 'Bearer ' + access_token,
      },
    })
      .then(function (response) {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json();
      })
      .catch(function (error) {
        return Error(error);
      });
  }

  // returns information about track with track_id in JSON
  static getTrack(access_token, track_id) {
    return fetch(`https://api.spotify.com/v1/tracks/${track_id}`, {
      headers: {
        Authorization: 'Bearer ' + access_token,
      },
    })
      .then(function (response) {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json();
      })
      .catch(function (error) {
        return Error(error);
      });
  }
}
