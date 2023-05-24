const { getDashboardUrl } = require("./utils");

const { CLIENT_ID } = process.env;

const jwtIoLink = (token) =>
  `<a href="https://jwt.io/#debugger-io?token=${token}">jwt.io &rsaquo;</a>`;

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
      hr { border: none; border-top: 1px solid #ddd; margin: 1.5em 0 }
      pre { overflow-wrap: break-word; white-space: break-spaces; padding: 1%; background: #f1f1f1 }
      label { font-size: 1em }
      input[type=text] { border: 1px solid #ddd; font-size: 1em; padding: 0.25em; max-width: 100%; width: 40em }
      input[type=submit] { font-size: 1.1em; padding: 0.5em; border-radius: 5px; border: none; cursor: pointer; background: #635DFF; color: white }
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
          ? `<a href="/logout">Logout</a>`
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
