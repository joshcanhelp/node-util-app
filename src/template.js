const { getDashboardUrl } = require("./utils");

const {
  CLIENT_ID,
} = process.env;

const getHeader = (request, title) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>${title}</title>
    <style>
      .login-status { font-size: 2em; display: inline-block; vertical-align: middle }
      .green { color: green }
      .red { color: red }
      
      body { padding: 2% }
      hr { border: none; border-top: 1px solid #ddd }
      pre { overflow-wrap: break-word; white-space: break-spaces; padding: 1%; background: #f1f1f1 }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    <p>
      ${
        request.oidc.isAuthenticated() ? 
          `<span class="green login-status">&bull;</span> Logged in as ${request.oidc.user.name}` : 
          '<span class="red login-status">&bull;</span> Logged out'
      }
    </p>
    <nav>
      <a href="/">&lsaquo; Home</a> 
      ${
        request.oidc.isAuthenticated() ? 
          `<a href="/logout">Logout</a>` : 
          `<a href="/login">Login</a>`
      }
    </nav>
    <hr>
`

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
`

module.exports = {
  getHeader,
  getFooter
}