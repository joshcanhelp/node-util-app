const { getDashboardUrl } = require("./utils");

const { CLIENT_ID } = process.env;

const jwtIoLink = (token) =>
  `<a href="https://jwt.io/#debugger-io?token=${token}">jwt.io &rsaquo;</a>`;

const colorPurple = "#635DFF";
const colorFaintGray = "#f1f1f1";
const colorLightGray = "#e1e1e1";

const getHeader = (request, title) => `
<!DOCTYPE html>
<html lang="en">
  <meta charset="utf-8">
  <head>
    <title>${title}</title>
    <link rel="stylesheet" href="/main.css">
  </head>
  <body>
    <h1>${title}</h1>
    <p>
      ${
        request.oidc.isAuthenticated()
          ? `<span class="green login-status">&bull;</span> Logged in as ${request.oidc.user.name}`
          : '<span class="red login-status">&bull;</span> Logged out'
      }
    </p>
    <nav>
      <a href="/">&lsaquo; Home</a> 
      ${
        request.oidc.isAuthenticated()
          ? `<a href="/logout">Logout</a> <a href="/wp-api">WP API</a>`
          : `<a href="/login">Login</a>`
      }
    </nav>
    <hr>
`;

const getFooter = () => `
    <hr>
    <footer>
      <ul>
        <li><a href="https://github.com/auth0/express-openid-connect">Express OIDC repo</a></li>
        <li><a href="https://auth0.github.io/express-openid-connect/index.html">Express OIDC docs</a></li>
        <li><a href="https://github.com/joshcanhelp/node-util-app">This app's repo</a></li>
        <li><a href="${getDashboardUrl(`/applications/${CLIENT_ID}/settings`)}">
          Application settings
        </a></li>
      </ul>
    </footer>
    <script src="/main.js"></script>
  </body>
</html>
`;

module.exports = {
  getHeader,
  getFooter,
  jwtIoLink,
};