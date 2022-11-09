# Simple Redirect Rule

First, follow the [Getting Started](https://github.com/joshcanhelp/node-util-app#getting-started) steps in the main repo README to get the Application up and running.

Next, create add the following code to a new [Action in the Login flow](https://auth0.com/docs/customize/actions/flows-and-triggers/login-flow):

```js
exports.onExecutePostLogin = async (event, api) => {
  api.redirect.sendUserTo("http://localhost:3000/redirect-from-auth0");
};

exports.onContinuePostLogin = async (event, api) => {};
```

With this Action activated, you should see a prompt on your localhost application after authentication but before returning to the app's homepage.
