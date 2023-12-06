# Auth0 Utility App

A simple Express application to assist with testing, PoCs, and other random
things.

## Getting Started

```bash
$ git clone git@github.com:joshcanhelp/node-util-app.git
$ cd node-util-app
$ npm install
$ cp .example.env .env
$ vim .env
```

[Create a Regular Web Application](https://manage.auth0.com/#/applications) in
Auth0 and use the **Client ID** and **Domain** values in the `.env` file you
created above.

```
# .env

SECRET=Long, random string
ISSUER_BASE_URL=Your Auth0 domain prepended with https://
CLIENT_ID=The Client ID for this application from Auth0
```

If you are requesting an access token to call an API, also add the following:

```
# .env

CLIENT_SECRET=The Client Secret for this application from Auth0
WP_API_AUDIENCE=The API identifier from Auth0
WP_API_SCOPES=Permissions requested
```

If you want to [create a post in WordPress](https://github.com/joshcanhelp/node-util-app/tree/master/routes/wp-api), also add the following:

```
# .env

WP_API_BASE_URL=Direct URL to a WordPress instance
```

The app should be ready to go!

```bash
$ npm start
$ open http://localhost:3000
```

Click login, use any identity provider, and you should end up back in your local app with a **Logout** link.

To provide TLS support, [install Caddy](https://caddyserver.com/docs/install) and adjust the `.env` file to identify the ports to use for the application (`APP_PORT`) and the Caddy proxy (`HTTPS_PORT`):

```
# .env

APP_PORT=5554
HTTPS_PORT=5555
```

Next, run the following in a new CLI tab:

```
$ npm run caddy
```

Finally, start the application:

```bash
$ npm start
$ open https://localhost:5555
```