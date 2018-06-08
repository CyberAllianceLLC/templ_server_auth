var q = require('q');
var j = require('joi');
var shortid = require('shortid');
var jwt = require('jsonwebtoken');

var lib = require('../index.js');
var knex = lib.config.DB;

var oauth = {};


//DONE: newAuthToken <refreshToken>
oauth.newAuthToken = function (query) {
  return q.fcall(function () {
    //FILTER
    j.assert(query, {
      refreshToken: j.string().required()
    });

    //verify signature
    var decoded = jwt.verify(query.refreshToken, lib.config.JWT);

    //verify token is refresh token
    j.assert(decoded.type, 'refresh');

    return {
      t_id: decoded.t_id
    };
  }).then(function (data) {
    //QUERY
    //delete refresh token
    return knex('tokens')
    .del()
    .where('t_id', '=', data.t_id)
    .where('type', '=', 'refresh')
    .returning([
      'u_id',
      'holder',
      'name',
      'scope'
    ]);

  }).then(function (data) {
    //AFTER
    j.assert(data, j.array().min(1).required());

    //create new refresh token
    return lib.util.newRefreshToken({
      u_id: data[0].u_id,
      holder: data[0].holder,
      name: data[0].name,
      scope: data[0].scope
    });

  });
};

//DONE: newApiRefreshToken <apiToken>
oauth.newApiRefreshToken = function (query) {
  return q.fcall(function () {
    //FILTER
    j.assert(query, {
      apiToken: j.string().required()
    });

    //verify signature
    var decoded = jwt.verify(query.apiToken, lib.config.JWT);

    //verify api token
    j.assert(decoded.type, 'api');

    return {
      t_id: decoded.t_id
    };
  }).then(function (data) {
    //QUERY
    //verify api token
    return knex('tokens')
    .select([
      'u_id',
      'holder',
      'name',
      'scope'
    ])
    .where('t_id', '=', data.t_id)
    .whereRaw('u_id = holder')
    .where('type', '=', 'api');

  }).then(function (data) {
    //AFTER
    j.assert(data, j.array().min(1).required());

    //create new refresh token
    return lib.util.newRefreshToken({
      u_id: data[0].u_id,
      holder: data[0].holder,
      name: data[0].name,
      scope: data[0].scope
    });

  });
};

//DONE: *newVendorRefreshToken (u_id, holder) <holder> <name> <[scope]>
oauth.newVendorRefreshToken = function (auth, query) {
  return q.fcall(function () {
    //FILTER
    j.assert(query, {
      holder: j.string().required(),
      name: j.string().max(100).required(),
      scope: j.array().items(j.string().valid(lib.config.TOKENS.vendor_scope).required()).unique().required()
    });

    //verify the person making the token has the rights
    j.assert(auth.u_id, auth.holder);

    //verify the vendor is not making a token with user's id
    j.assert(query.holder, j.string().invalid(auth.u_id).required());

    return {
      u_id: auth.u_id,
      holder: query.holder,
      name: query.name,
      scope: query.scope
    };
  }).then(function (data) {
    //AFTER
    //create new refresh token
    return lib.util.newRefreshToken({
      u_id: data.u_id,
      holder: data.holder,
      name: data.name,
      scope: data.scope
    });

  });
};

//DONE: *newApiToken (u_id, holder) <name> <[scope]>
oauth.newApiToken = function (auth, query) {
  return q.fcall(function () {
    //FILTER
    j.assert(query, {
      name: j.string().max(100).required(),
      scope: j.array().items(j.string().valid(lib.config.TOKENS.api_scope).required()).unique().required()
    });

    //verify the person making the api key has the rights
    j.assert(auth.u_id, auth.holder);

    return {
      u_id: auth.u_id,
      holder: auth.u_id,
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
      type: 'api',
      name: data.name,
      scope: data.scope,
      expires: knex.raw("now() + (make_interval(secs => 1) * ?) ", [lib.config.TOKENS.apiTokenExpire])
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

    //create api token
    var apiToken = jwt.sign({
      t_id: data[0].t_id,
      u_id: data[0].u_id,
      holder: data[0].holder,
      type: 'api',
      name: data[0].name,
      scope: data[0].scope
    }, lib.config.JWT, {
      expiresIn: lib.config.TOKENS.apiTokenExpire
    });

    return {
      apiToken: apiToken
    };
  });
};

//DONE: *getUserTokenInfo (u_id)
oauth.getUserTokenInfo = function (auth) {
  return q.fcall(function () {
    //FILTER
    return {
      u_id: auth.u_id
    };
  }).then(function (data) {
    //QUERY
    return knex('tokens')
    .select([
      't_id',
      'u_id',
      'holder',
      'type',
      'name',
      'scope',
      'expires',
      'created_at'
    ])
    .where('u_id', '=', data.u_id)
    .orderBy('created_at', 'DESC');

  }).then(function (data) {
    //AFTER
    return data;
  });
};

//DONE: *removeTokens (u_id) <[t_id]>
oauth.removeTokens = function (auth, query) {
  return q.fcall(function () {
    //FILTER
    j.assert(query, {
      t_id: j.array().items(j.string().required()).required()
    });

    return {
      u_id: auth.u_id,
      t_id: query.t_id
    };
  }).then(function (data) {
    //QUERY
    return knex('tokens')
    .del()
    .whereIn('t_id', data.t_id)
    .where(function(p1) {
      p1.where('u_id', '=', data.u_id).orWhere('holder', '=', data.u_id)
    });

  }).then(function (data) {
    //AFTER
    return 'tokens removed';
  });
};


module.exports = oauth;