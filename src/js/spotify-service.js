//url= https://api.spotify.com/v1/
//client ID = ${process.env.CLIENT_ID}

export default class SpotifyService {
  static redirectToSpotifyAuthorizeEndpoint(client_id, redirect_uri) {
    const codeVerifier = this.generateRandomString(64);

    this.generateCodeChallenge(codeVerifier).then((code_challenge) => {
      window.localStorage.setItem('code_verifier', codeVerifier);

      // Redirect to example:
      // GET https://accounts.spotify.com/authorize?response_type=code&client_id=77e602fc63fa4b96acff255ed33428d3&redirect_uri=http%3A%2F%2Flocalhost&scope=user-follow-modify&state=e21392da45dbf4&code_challenge=KADwyz1X~HIdcAG20lnXitK6k51xBP4pEMEZHmCneHD1JhrcHjE1P3yU_NjhBz4TdhV6acGo16PCd10xLwMJJ4uCutQZHw&code_challenge_method=S256

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

      // If the user accepts spotify will come back to your application with the code in the response query string
      // Example: http://127.0.0.1:8080/?code=NApCCg..BkWtQ&state=profile%2Factivity
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

    return (
      fetch('https://accounts.spotify.com/api/token', {
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
        //.then(this.addThrowErrorToFetch)
        .then((data) => {
          return data.json();
        })
        // .catch(this.handleError);
        .catch(function (error) {
          return Error(error);
        })
    );
  }

  static refreshToken(client_id, refresh_token) {
    return (
      fetch('https://accounts.spotify.com/api/token', {
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
        // .catch(this.handleError);
        .catch(function (error) {
          return Error(error);
        })
    );
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
      // .then((data) => {
      //   console.log(data);
      // })
      // .catch((error) => {
      //   console.error(error);
      // });
    } catch (error) {
      return error.message;
    }
  }
}
