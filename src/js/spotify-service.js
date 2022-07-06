//url= https://api.spotify.com/v1/
//client ID = ${process.env.CLIENT_ID}

export default class SpotifyService {
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

  static generateRandomString(length) {
    let text = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

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

  static processTokenResponse(data) {
    console.log(data);
    data = data.json();
    let access_token = data.access_token;
    let refresh_token = data.refresh_token;

    const t = new Date();
    let expires_at = t.setSeconds(t.getSeconds() + data.expires_in);

    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('expires_at', expires_at);

    return [access_token, refresh_token, expires_at];
  }

  static async getUserData(access_token) {
    try {
      fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: 'Bearer ' + access_token,
        },
      }).then(async (response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw await response.json();
        }
      });
    } catch (error) {
      return error.message;
    }
  }

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

  static getTopArtist(access_token) {
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
}
