var q = require('q');
var j = require('joi');
var jwt = require('jsonwebtoken');
var _ = require('lodash');

var lib = require('../index.js');

var middleware = {};


//DONE: auth
middleware.auth = function(req, res, next) {
  q.fcall(function() {
    //auth token
    var authToken = _.replace(req.headers['authorization'], 'Bearer ', '');

    //verify token
    var decoded = jwt.verify(authToken, lib.config.JWT);

    //verify token is an auth token
    j.assert(decoded.type, 'auth');

    //check if user has permission to this address
    var address = _.replace(req.url, '/', '');
    j.assert(address, j.string().valid(decoded.scope).required());

    return decoded;

  }).then(function(data) {
    //user is authenticated
    req.auth = data;
    next();

  }).catch(function(error) {
    //user is not authenticated
    res.json({
      success: false,
      response: 'authentication failed'
    });
  });
};


module.exports = middleware;