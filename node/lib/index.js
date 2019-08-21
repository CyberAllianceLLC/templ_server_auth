const config = require('../config.js');

//Configuration
exports.config = {
  JWT: config.JWT,
  TOKENS: {
    authTokenExpire: 60 * 20, //20 minutes
    refreshTokenExpire: 60 * 60 * 24 * 365, //1 year
    apiTokenExpire: 60 * 60 * 24 * 365 * 1000, //1000 years
    user_scope: [
      'newVendorAccessToken',
      'newVendorAuthToken',
      'newApiToken',
      'getUserTokenInfo',
      'deleteTokens',
      'getUserInfo',
      'newEmail',
      'deleteUser',
      'newPassword'
    ],
    api_scope: [
      'newVendorAccessToken',
      'newVendorAuthToken',
      'getUserTokenInfo',
      'deleteTokens',
      'getUserInfo'
    ],
    vendor_scope: [
      'getUserInfo'
    ]
  },
  DB: require('knex')({
    client: 'pg',
    connection: config.DB,
    debug: false
  }),
  SMTP: config.SMTP
};

//Libraries
//internal
exports.middleware = require('./internal/middleware.js');
exports.cronjobs = require('./internal/cronjobs.js');
exports.util = require('./internal/util.js');

//api
exports.oauth = require('./api/oauth.js');
exports.users = require('./api/users.js');
