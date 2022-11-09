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

SECRET=LONG RANDOM STRING
ISSUER_BASE_URL=https://AUTH0_DOMAIN
CLIENT_ID=AUTH0_CLIENT_ID
```

Click login, use any identity provider, and you should end up back in your local
app with a **Logout** link.

The app should be ready to go!

```bash
$ npm start
$ open http://localhost:3000
```
