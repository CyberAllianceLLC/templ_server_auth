var express = require('express');
var router = express.Router();

var lib = require('../lib/index.js');
var mid = lib.middleware;


//===== OAUTH =====
//DONE: newAuthToken <refreshToken>
router.post('/newAuthToken', function (req, res, next) {
  lib.oauth.newAuthToken(req.body).then(function (data) {
    res.json({
      success: true,
      response: data
    });
  }).catch(function (error) {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: newApiAuthToken <apiToken>
router.post('/newApiAuthToken', function (req, res, next) {
  lib.oauth.newApiAuthToken(req.body).then(function (data) {
    res.json({
      success: true,
      response: data
    });
  }).catch(function (error) {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: *newVendorAccessToken (user_id, holder) <holder> <redirect_uri> <[scope]>
router.post('/newVendorAccessToken', mid.auth, function (req, res, next) {
  lib.oauth.newVendorAccessToken(req.auth, req.body).then(function (data) {
    res.json({
      success: true,
      response: data
    });
  }).catch(function (error) {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: *newVendorAuthToken (user_id, holder) <accessToken> <redirect_uri> <[scope]>
router.post('/newVendorAuthToken', mid.auth, function (req, res, next) {
  lib.oauth.newVendorAuthToken(req.auth, req.body).then(function (data) {
    res.json({
      success: true,
      response: data
    });
  }).catch(function (error) {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: *newApiToken (user_id, holder) <name> <[scope]>
router.post('/newApiToken', mid.auth, function (req, res, next) {
  lib.oauth.newApiToken(req.auth, req.body).then(function (data) {
    res.json({
      success: true,
      response: data
    });
  }).catch(function (error) {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: *getUserTokenInfo (user_id)
router.post('/getUserTokenInfo', mid.auth, function (req, res, next) {
  lib.oauth.getUserTokenInfo(req.auth, req.body).then(function (data) {
    res.json({
      success: true,
      response: data
    });
  }).catch(function (error) {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: *deleteTokens (user_id) <[token_id]>
router.post('/deleteTokens', mid.auth, function (req, res, next) {
  lib.oauth.deleteTokens(req.auth, req.body).then(function (data) {
    res.json({
      success: true,
      response: data
    });
  }).catch(function (error) {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});


//===== USERS =====
//DONE: newUser <email> <password>
router.post('/newUser', function (req, res, next) {
  lib.users.newUser(req.body).then(function (data) {
    res.json({
      success: true,
      response: data
    });
  }).catch(function (error) {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: loginUser (ip_address) <email> <password>
router.post('/loginUser', function (req, res, next) {
  var ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim();
  lib.users.loginUser(ip, req.body).then(function (data) {
    res.json({
      success: true,
      response: data
    });
  }).catch(function (error) {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: sendRecoveryEmail <email>
router.post('/sendRecoveryEmail', function (req, res, next) {
  lib.users.sendRecoveryEmail(req.body).then(function (data) {
    res.json({
      success: true,
      response: data
    });
  }).catch(function (error) {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: verifyRecoveryEmail (ip_address) <user_id> <new_password> <recovery_key>
router.post('/verifyRecoveryEmail', function (req, res, next) {
  var ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim();
  lib.users.verifyRecoveryEmail(ip, req.body).then(function (data) {
    res.json({
      success: true,
      response: data
    });
  }).catch(function (error) {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: *getUserInfo (user_id)
router.post('/getUserInfo', mid.auth, function (req, res, next) {
  lib.users.getUserInfo(req.auth).then(function (data) {
    res.json({
      success: true,
      response: data
    });
  }).catch(function (error) {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: *newEmail (user_id) <email>
router.post('/newEmail', mid.auth, function (req, res, next) {
  lib.users.newEmail(req.auth, req.body).then(function (data) {
    res.json({
      success: true,
      response: data
    });
  }).catch(function (error) {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: verifyNewEmail <user_id> <new_email> <recovery_key>
router.post('/verifyNewEmail', function (req, res, next) {
  lib.users.verifyNewEmail(req.body).then(function (data) {
    res.json({
      success: true,
      response: data
    });
  }).catch(function (error) {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: *deleteUser (user_id) <password>
router.post('/deleteUser', mid.auth, function (req, res, next) {
  lib.users.deleteUser(req.auth, req.body).then(function (data) {
    res.json({
      success: true,
      response: data
    });
  }).catch(function (error) {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});

//DONE: *newPassword (ip_address) (user_id) <password> <new_password>
router.post('/newPassword', mid.auth, function (req, res, next) {
  var ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim();
  lib.users.newPassword(ip, req.auth, req.body).then(function (data) {
    res.json({
      success: true,
      response: data
    });
  }).catch(function (error) {
    res.json({
      success: false,
      response: 'request failed'
    });
  });
});


module.exports = router;