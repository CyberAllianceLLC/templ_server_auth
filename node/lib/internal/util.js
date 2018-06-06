var q = require('q');
var j = require('joi');
var shortid = require('shortid');
var jwt = require('jsonwebtoken');

var lib = require('../index.js');
var knex = lib.config.DB;

var util = {};


//DONE: newRefreshToken <u_id> <holder> <name> <[scope]>
util.newRefreshToken = function (query) {
  return q.fcall(function () {
    //FILTER
    j.assert(query, {
      u_id: j.string().token().min(3).max(20).required(),
      holder: j.string().token().min(3).max(20).required(),
      name: j.string().max(100).required(),
      scope: j.array().items(j.string().valid(lib.config.TOKENS.user_scope).required()).unique().required()
    });

    return {
      u_id: query.u_id,
      holder: query.holder,
      name: query.name,
      scope: query.scope
    };
  }).then(function (data) {
    //QUERY
    return knex('tokens')
    .insert({
      t_id: shortid.generate(),
      u_id: data.u_id,
      holder: data.holder,
      type: 'refresh',
      name: data.name,
      scope: data.scope,
      expires: knex.raw("now() + (make_interval(secs => 1) * ?) ", [lib.config.TOKENS.refreshTokenExpire])
    })
    .returning([
      't_id',
      'u_id',
      'holder',
      'name',
      'scope'
    ]);

  }).then(function (data) {
    //AFTER
    j.assert(data, j.array().min(1).required());

    //create refresh token
    var refreshToken = jwt.sign({
      t_id: data[0].t_id,
      u_id: data[0].u_id,
      holder: data[0].holder,
      type: 'refresh',
      name: data[0].name,
      scope: data[0].scope
    }, lib.config.JWT, {
      expiresIn: lib.config.TOKENS.refreshTokenExpire
    });

    //create auth token
    var authToken = jwt.sign({
      t_id: data[0].t_id,
      u_id: data[0].u_id,
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

//DONE: removeAllSessions <u_id>
util.removeAllSessions = function (query) {
  return q.fcall(function () {
    //FILTER
    return {
      u_id: query.u_id
    };
  }).then(function (data) {
    //QUERY
    return knex('tokens')
    .del()
    .where('u_id', '=', data.u_id)
    .where('holder', '=', data.u_id)
    .where('type', '=', 'refresh')

  }).then(function (data) {
    //AFTER
    return 'sessions removed';
  });
};


module.exports = util;