const express = require('express');
const router = express.Router();

const lib = require('../lib/index.js');
const mid = lib.middleware;


//===== OAUTH =====
//DONE: newAuthToken <refreshToken>
router.post('/newAuthToken', (req, res, next) => {
  lib.oauth.newAuthToken(req.body).then((data) => {
    res.json({
      success: true,
      response: data
    });
  }).catch((error) => {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: newApiAuthToken <apiToken>
router.post('/newApiAuthToken', (req, res, next) => {
  lib.oauth.newApiAuthToken(req.body).then((data) => {
    res.json({
      success: true,
      response: data
    });
  }).catch((error) => {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: *newVendorAccessToken (user_id, holder) <holder> <redirect_uri> <[scope]>
router.post('/newVendorAccessToken', mid.auth, (req, res, next) => {
  lib.oauth.newVendorAccessToken(req.auth, req.body).then((data) => {
    res.json({
      success: true,
      response: data
    });
  }).catch((error) => {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: *newVendorAuthToken (user_id, holder) <accessToken> <redirect_uri> <[scope]>
router.post('/newVendorAuthToken', mid.auth, (req, res, next) => {
  lib.oauth.newVendorAuthToken(req.auth, req.body).then((data) => {
    res.json({
      success: true,
      response: data
    });
  }).catch((error) => {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: *newApiToken (user_id, holder) <name> <[scope]>
router.post('/newApiToken', mid.auth, (req, res, next) => {
  lib.oauth.newApiToken(req.auth, req.body).then((data) => {
    res.json({
      success: true,
      response: data
    });
  }).catch((error) => {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: *getUserTokenInfo (user_id)
router.post('/getUserTokenInfo', mid.auth, (req, res, next) => {
  lib.oauth.getUserTokenInfo(req.auth, req.body).then((data) => {
    res.json({
      success: true,
      response: data
    });
  }).catch((error) => {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: *deleteTokens (user_id) <[token_id]>
router.post('/deleteTokens', mid.auth, (req, res, next) => {
  lib.oauth.deleteTokens(req.auth, req.body).then((data) => {
    res.json({
      success: true,
      response: data
    });
  }).catch((error) => {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});


//===== USERS =====
//DONE: newUser <email> <password>
router.post('/newUser', (req, res, next) => {
  lib.users.newUser(req.body).then((data) => {
    res.json({
      success: true,
      response: data
    });
  }).catch((error) => {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: loginUser (ip_address) <email> <password>
router.post('/loginUser', (req, res, next) => {
  let ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim();
  lib.users.loginUser(ip, req.body).then((data) => {
    res.json({
      success: true,
      response: data
    });
  }).catch((error) => {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: sendRecoveryEmail <email>
router.post('/sendRecoveryEmail', (req, res, next) => {
  lib.users.sendRecoveryEmail(req.body).then((data) => {
    res.json({
      success: true,
      response: data
    });
  }).catch((error) => {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: verifyRecoveryEmail (ip_address) <user_id> <new_password> <recovery_key>
router.post('/verifyRecoveryEmail', (req, res, next) => {
  let ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim();
  lib.users.verifyRecoveryEmail(ip, req.body).then((data) => {
    res.json({
      success: true,
      response: data
    });
  }).catch((error) => {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: *getUserInfo (user_id)
router.post('/getUserInfo', mid.auth, (req, res, next) => {
  lib.users.getUserInfo(req.auth).then((data) => {
    res.json({
      success: true,
      response: data
    });
  }).catch((error) => {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: *newEmail (user_id) <email>
router.post('/newEmail', mid.auth, (req, res, next) => {
  lib.users.newEmail(req.auth, req.body).then((data) => {
    res.json({
      success: true,
      response: data
    });
  }).catch((error) => {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: verifyNewEmail <user_id> <new_email> <recovery_key>
router.post('/verifyNewEmail', (req, res, next) => {
  lib.users.verifyNewEmail(req.body).then((data) => {
    res.json({
      success: true,
      response: data
    });
  }).catch((error) => {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: *newPassword (ip_address) (user_id) <password> <new_password>
router.post('/newPassword', mid.auth, (req, res, next) => {
  let ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim();
  lib.users.newPassword(ip, req.auth, req.body).then((data) => {
    res.json({
      success: true,
      response: data
    });
  }).catch((error) => {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: *deleteUser (user_id) <password>
router.post('/deleteUser', mid.auth, (req, res, next) => {
  lib.users.deleteUser(req.auth, req.body).then((data) => {
    res.json({
      success: true,
      response: data
    });
  }).catch((error) => {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});


module.exports = router;