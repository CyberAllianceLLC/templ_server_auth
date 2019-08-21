const j = require('@hapi/joi');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

const lib = require('../index.js');

let middleware = {};


//DONE: auth
middleware.auth = (req, res, next) => {
  Promise.resolve().then(() => {
    //auth token
    let authToken = _.replace(req.headers['authorization'], 'Bearer ', '');

    //verify token
    let decoded = jwt.verify(authToken, lib.config.JWT);

    //verify token is an auth token
    j.assert(decoded.type, 'auth');

    //check if user has permission to this address
    let address = _.replace(req.url, '/', '');
    j.assert(address, j.string().valid(decoded.scope).required());

    return decoded;

  }).then((data) => {
    //user is authenticated
    req.auth = data;
    next();

  }).catch((error) => {
    //user is not authenticated
    res.json({
      success: false,
      response: 'authentication failed'
    });
  });
};


module.exports = middleware;