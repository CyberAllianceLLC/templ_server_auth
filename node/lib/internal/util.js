var q = require('q');
var j = require('joi');
var shortid = require('shortid');
var jwt = require('jsonwebtoken');

var lib = require('../index.js');
var knex = lib.config.DB;

var util = {};


//DONE: newRefreshToken <user_id> <holder> <name> <[scope]>
util.newRefreshToken = function (query) {
  return q.fcall(function () {
    //FILTER
    j.assert(query, {
      user_id: j.string().required(),
      holder: j.string().required(),
      name: j.string().max(100).required(),
      scope: j.array().items(j.string().valid(lib.config.TOKENS.user_scope).required()).unique().required()
    });

    return {
      user_id: query.user_id,
      holder: query.holder,
      name: query.name,
      scope: query.scope
    };
  }).then(function (data) {
    //QUERY
    return knex('tokens')
    .insert({
      token_id: shortid.generate(),
      user_id: data.user_id,
      holder: data.holder,
      type: 'refresh',
      name: data.name,
      scope: data.scope,
      expires: knex.raw("now() + (make_interval(secs => 1) * ?) ", [lib.config.TOKENS.refreshTokenExpire])
    })
    .returning([
      'token_id',
      'user_id',
      'holder',
      'name',
      'scope'
    ]);

  }).then(function (data) {
    //AFTER
    j.assert(data, j.array().min(1).required());

    //create refresh token
    var refreshToken = jwt.sign({
      token_id: data[0].token_id,
      user_id: data[0].user_id,
      holder: data[0].holder,
      type: 'refresh',
      name: data[0].name,
      scope: data[0].scope
    }, lib.config.JWT, {
      expiresIn: lib.config.TOKENS.refreshTokenExpire
    });

    //create auth token
    var authToken = jwt.sign({
      token_id: data[0].token_id,
      user_id: data[0].user_id,
      holder: data[0].holder,
      type: 'auth',
      name: data[0].name,
      scope: data[0].scope
    }, lib.config.JWT, {
      expiresIn: lib.config.TOKENS.authTokenExpire
    });

    return {
      refreshToken: refreshToken,
      authToken: authToken
    };
  });
};

//DONE: deleteAllSessions <user_id>
util.deleteAllSessions = function (query) {
  return q.fcall(function () {
    //FILTER
    return {
      user_id: query.user_id
    };
  }).then(function (data) {
    //QUERY
    return knex('tokens')
    .del()
    .where('user_id', '=', data.user_id)
    .where('holder', '=', data.user_id)
    .where('type', '=', 'refresh')

  }).then(function (data) {
    //AFTER
    return 'sessions deleted';
  });
};


module.exports = util;