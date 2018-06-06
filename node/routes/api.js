var express = require('express');
var router = express.Router();

var lib = require('../lib/index.js');
var mid = lib.middleware;


//===== OAUTH =====
//CHECK: newAuthToken <refreshToken>
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

//CHECK: newApiRefreshToken <apiToken>
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

//CHECK: *newVendorRefreshToken (u_id, holder) <holder> <name> <[scope]>
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

//CHECK: *newApiToken (u_id, holder) <name> <[scope]>
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

//CHECK: *getUserTokenInfo (u_id)
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

//CHECK: *removeTokens (u_id) <[t_id]>
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
//CHECK: getUsers <[u_id]>
router.post('/getUsers', function (req, res, next) {
  lib.users.getUsers(req.body).then(function (data) {
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

//CHECK: newUser <username> <email> <password>
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

//CHECK: loginUser (ip_address) <email> <password>
router.post('/loginUser', function (req, res, next) {
  lib.users.loginUser(req.ip, req.body).then(function (data) {
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

//CHECK: sendRecoveryEmail <email>
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

//CHECK: enterRecoveryKey (ip_address) <u_id> <new_password> <recovery_key>
router.post('/enterRecoveryKey', function (req, res, next) {
  lib.users.enterRecoveryKey(req.ip, req.body).then(function (data) {
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

//CHECK: *getUserSettings (u_id)
router.post('/getUserSettings', mid.auth, function (req, res, next) {
  lib.users.getUserSettings(req.auth).then(function (data) {
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

//CHECK: *newEmail (u_id) <email>
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

//CHECK: verifyNewEmail <u_id> <new_email> <recovery_key>
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

//CHECK: *removeUser (u_id) <password>
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

//CHECK: *newPassword (ip_address) (u_id) <password> <new_password>
router.post('/newPassword', mid.auth, function (req, res, next) {
  lib.users.newPassword(req.ip, req.auth, req.body).then(function (data) {
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