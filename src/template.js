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
  <head>
    <title>${title}</title>
    <style>
      .login-status { font-size: 2em; display: inline-block; vertical-align: middle }
      .green { color: green }
      .red { color: red }
      
      body { 
        padding: 2%; 
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, 
          Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        line-height: 1.5em;
      }
      p { margin: 1em 0; }
      hr { border: none; border-top: 1px solid ${colorLightGray}; margin: 1.5em 0 }
      pre { overflow-wrap: break-word; white-space: break-spaces; padding: 1%; background: ${colorFaintGray} }
      code { display: inline-block; background: ${colorFaintGray}; padding: 0 0.5em }
      label { font-size: 1em }
      input[type=text], textarea { 
        border: 1px solid ${colorLightGray}; font-size: 1em; border-radius: 2px; padding: 0.25em; 
        max-width: 100%; width: 40em; display: block; margin: 0.5em 0; 
      }
      textarea { height: 6em }
      input[type=submit] { 
        font-size: 1.1em; padding: 0.5em; border-radius: 5px; border: none; cursor: pointer; 
        background: ${colorPurple}; color: white 
      }
    </style>
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
  </body>
</html>
`;

module.exports = {
  getHeader,
  getFooter,
  jwtIoLink,
};
