# Simple Redirect Rule

First, follow the [Getting Started](https://github.com/joshcanhelp/node-util-app) steps in the main repo README to get the Application up and running.

Next, create add the following code to an empty Rule:

```js
function (user, context, callback) {
    context.redirect = {
        url: "http://localhost:3000/redirect-rule"
    };
    return callback(null, user, context);
}
```

With this rule activated, you should see a prompt on your localhost application after authentication but before returning to the app's homepage.
