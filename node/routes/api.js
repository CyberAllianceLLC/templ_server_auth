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

//DONE: newApiRefreshToken <apiToken>
router.post('/newApiRefreshToken', function (req, res, next) {
  lib.oauth.newApiRefreshToken(req.body).then(function (data) {
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

//DONE: *newVendorRefreshToken (u_id, holder) <holder> <name> <[scope]>
router.post('/newVendorRefreshToken', mid.auth, function (req, res, next) {
  lib.oauth.newVendorRefreshToken(req.auth, req.body).then(function (data) {
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

//DONE: *newApiToken (u_id, holder) <name> <[scope]>
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

//DONE: *getUserTokenInfo (u_id)
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

//DONE: *removeTokens (u_id) <[t_id]>
router.post('/removeTokens', mid.auth, function (req, res, next) {
  lib.oauth.removeTokens(req.auth, req.body).then(function (data) {
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

//DONE: verifyRecoveryEmail (ip_address) <u_id> <new_password> <recovery_key>
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

//DONE: *getUserInfo (u_id)
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

//DONE: *newEmail (u_id) <email>
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

//DONE: verifyNewEmail <u_id> <new_email> <recovery_key>
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

//DONE: *removeUser (u_id) <password>
router.post('/removeUser', mid.auth, function (req, res, next) {
  lib.users.removeUser(req.auth, req.body).then(function (data) {
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

//DONE: *newPassword (ip_address) (u_id) <password> <new_password>
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