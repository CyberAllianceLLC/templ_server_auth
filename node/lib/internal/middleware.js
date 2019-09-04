const j = require('@hapi/joi');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

const lib = require('../index.js');
const knex = lib.config.DB;

let middleware = {};


//DONE: auth
middleware.auth = (req, res, next) => {
  Promise.resolve().then(() => {
    //auth token
    let authToken = _.replace(req.headers['authorization'], 'Bearer ', '');

    //verify token
    let decoded = jwt.verify(authToken, lib.config.JWT);

    //check if user has permission to this address
    let address = _.replace(req.path, '/', '');
    j.assert(address, j.string().valid(decoded.scope).required());

    //verify token is an auth token
    if(decoded.type === 'auth') {
      return decoded;
    }
    //verify token is an API token
    else if(decoded.type === 'api') {
      return knex('tokens')
      .select(['token_id'])
      .where('token_id', decoded.token_id)
      .where('user_id', decoded.user_id)
      .where('holder', decoded.user_id)
      .where('type', 'api')
      .then((token) => {
        // verify token exists
        j.assert(token, j.array().min(1).required());
        return decoded;
      });
    }
    else {
      throw 'invalid token type';
    }

  })
  //user is authenticated
  .then((data) => {
    req.auth = data;
    next();
  })
  //user is not authenticated
  .catch((error) => {
    res.json({
      success: false,
      response: 'authentication failed'
    });
  });
};


module.exports = middleware;