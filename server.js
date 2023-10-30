const express = require('express');
const session = require('express-session');
const { ExpressOIDC } = require('@okta/oidc-middleware');
const jwt = require('jsonwebtoken');

const app = express();
const oidc = new ExpressOIDC({
  issuer: 'issuer URL from Okta, example: https://trial-9890932.okta.com/oauth2/default',
  client_id: 'client id of your Okta app',
  client_secret: 'client secret of your okta app',
  appBaseUrl: 'http://localhost:8080',
  scope: 'openid profile'
});

app.use(session({
  secret: 'this-should-be-very-random',
  resave: true,
  saveUninitialized: false
}));
app.use(oidc.router);

const jwtSigningKey = "gitbook signing key"

app.get('/', (req, res) => {
  if (req.userContext) {
    const token = jwt.sign({}, jwtSigningKey, { expiresIn: '1h' });
    const redirectURL = `https://example.gitbook.io/example/?jwt_token=${token}`;
    res.redirect(redirectURL);
  } else {
    res.send('Please <a href="/login">login</a>');
  }
});

app.get('/protected', oidc.ensureAuthenticated(), (req, res) => {
  res.send('Top Secret');
});

oidc.on('ready', () => {
  app.listen(8080, () => console.log('app started'));
});

oidc.on('error', err => {
  // An error occurred while setting up OIDC, during token revokation, or during post-logout handling
});
