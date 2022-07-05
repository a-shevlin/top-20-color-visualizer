//url= https://api.spotify.com/v1/
//client ID = ${process.env.CLIENT_ID}


export default class SpotifyService {
  static async getSpotifyAPI() {
    let SpotifyWebApi = require('spotify-web-api-node');
    let express = require('express');

    const scopes = [
      'ugc-image-upload',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'streaming',
      'app-remote-control',
      'user-read-email',
      'user-read-private',
      'playlist-read-collaborative',
      'playlist-modify-public',
      'playlist-read-private',
      'playlist-modify-private',
      'user-library-modify',
      'user-library-read',
      'user-top-read',
      'user-read-playback-position',
      'user-read-recently-played',
      'user-follow-read',
      'user-follow-modify'
    ];
    
    let spotifyApi = new SpotifyWebApi({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      redirectUri: 'http://localhost:8080/callback'
    });

    const app = express();

    app.get('./login', (req, res) => {
      res.redirect(spotifyApi.createAuthorizeURL(scopes));
    });

    app.get('/callback', (req, res) => {
      const error = req.query.error;
      const code = req.query.code;
    
      if (error) {
        console.error('Callback Error:', error);
        res.send(`Callback Error: ${error}`);
        return;
      }
    
      spotifyApi
        .authorizationCodeGrant(code)
        .then(data => {
          const access_token = data.body['access_token'];
          const refresh_token = data.body['refresh_token'];
          const expires_in = data.body['expires_in'];
    
          spotifyApi.setAccessToken(access_token);
          spotifyApi.setRefreshToken(refresh_token);
    
          console.log('access_token:', access_token);
          console.log('refresh_token:', refresh_token);
    
          console.log(
            `Sucessfully retreived access token. Expires in ${expires_in} s.`
          );
          res.send('Success! You can now close the window.');
    
          setInterval(async () => {
            const data = await spotifyApi.refreshAccessToken();
            const access_token = data.body['access_token'];
    
            console.log('The access token has been refreshed!');
            console.log('access_token:', access_token);
            spotifyApi.setAccessToken(access_token);
          }, expires_in / 2 * 1000);
        })
        .catch(error => {
          console.error('Error getting Tokens:', error);
          res.send(`Error getting Tokens: ${error}`);
        });
    });
    
    app.listen(8080, () =>
      console.log(
        'HTTP Server up. Now go to http://localhost:8080/login in your browser.'
      )
    );
    return spotifyApi;
  }
}



