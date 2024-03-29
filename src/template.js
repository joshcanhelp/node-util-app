const { CLIENT_ID, TENANT_NAME } = process.env;

const jwtIoLink = (token) =>
  `<a href="https://jwt.io/#debugger-io?token=${token}" target="_blank">[jwt.io]</a>`;

const getHeader = (request, title) => `
<!DOCTYPE html>
<html lang="en">
  <meta charset="utf-8">
  <head>
    <title>${title} - Node Util App</title>
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
      <a href="/" class="button">&lsaquo; Home</a> 
      ${
        request.oidc.isAuthenticated()
          ? `<a href="/logout" class="button">Logout</a> <a href="/step-up" class="button">Step-Up</a> <a href="/wp-api" class="button">WP API</a> <a href="/m2m-api" class="button">M2M</a>`
          : `<a href="/login" class="button">Login</a>`
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
        ${
          TENANT_NAME
            ? `<li><a href="https://manage.auth0.com/dashboard/${
                TENANT_NAME.split("@")[1]
              }/${
                TENANT_NAME.split("@")[0]
              }/applications/${CLIENT_ID}/settings">
          Application settings
        </a></li>`
            : ""
        }
        
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
