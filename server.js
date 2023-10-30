const express = require('express');
const session = require('express-session');
const { ExpressOIDC } = require('@okta/oidc-middleware');
const jwt = require('jsonwebtoken');

const app = express();
const oidc = new ExpressOIDC({
  issuer: 'issuer URL from Okta, example: https://trial-9890932.okta.com/oauth2/default',
  client_id: 'client id of your Okta app',
  client_secret: 'client secret of your okta app',
  appBaseUrl: 'http://localhost:3000',
  scope: 'openid profile'
});

app.use(session({
  secret: 'this-should-be-very-random',
  resave: true,
  saveUninitialized: false
}));
app.use(oidc.router);

const jwtSigningKey = "8e890ca1-b16e-499f-j0rd-68ea7d0de55q"

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
  app.listen(3000, () => console.log('app started'));
});

oidc.on('error', err => {
  // An error occurred while setting up OIDC, during token revokation, or during post-logout handling
});
