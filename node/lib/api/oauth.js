var q = require('q');
var j = require('joi');
var shortid = require('shortid');
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var urijs = require('urijs');

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
      token_id: decoded.token_id
    };
  }).then(function (data) {
    //QUERY
    //delete refresh token
    return knex('tokens')
    .del()
    .where('token_id', '=', data.token_id)
    .where('type', '=', 'refresh')
    .returning([
      'user_id',
      'holder',
      'name',
      'scope'
    ]);

  }).then(function (data) {
    //AFTER
    j.assert(data, j.array().min(1).required());

    //create new refresh token
    return lib.util.newRefreshToken({
      user_id: data[0].user_id,
      holder: data[0].holder,
      name: data[0].name,
      scope: data[0].scope
    });

  });
};

//CHECK: newApiAuthToken <apiToken>
oauth.newApiAuthToken = function (query) {
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
      token_id: decoded.token_id
    };
  }).then(function (data) {
    //QUERY
    //verify api token
    return knex('tokens')
    .select([
      'token_id',
      'user_id',
      'holder',
      'name',
      'scope'
    ])
    .where('token_id', '=', data.token_id)
    .whereRaw('user_id = holder')
    .where('type', '=', 'api');

  }).then(function (data) {
    //AFTER
    j.assert(data, j.array().min(1).required());

    //create new auth token
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
      authToken: authToken
    };
  });
};

//CHECK: *newVendorAccessToken (user_id, holder) <holder> <redirect_uri> <[scope]>
oauth.newVendorAccessToken = function (auth, query) {
  return q.fcall(function () {
    //FILTER
    j.assert(query, {
      holder: j.string().required(),
      redirect_uri: j.string().required(),
      scope: j.array().items(j.string().valid(lib.config.TOKENS.vendor_scope).required()).unique().required()
    });

    //verify the person making the request is the account owner
    if(auth.user_id !== auth.holder) throw 'must be account owner making request';

    //verify the vendor is not making a token with the user's id as the holder
    if(auth.user_id === query.holder) throw 'must be a third party holder';

    //extract name from redirect_uri
    var name = '';
    var redirectUri = new urijs(query.redirect_uri);
    if(redirectUri.protocol() === 'https' || redirectUri.protocol() === 'http'){
      name = redirectUri.domain();
    }else{
      name = redirectUri.protocol();
    }

    return {
      user_id: auth.user_id,
      holder: query.holder,
      redirect_uri: query.redirect_uri,
      name: name,
      scope: query.scope
    };
  }).then(function (data) {
    //AFTER
    //create access token
    var accessToken = jwt.sign({
      token_id: shortid.generate(),
      user_id: data.user_id,
      holder: data.holder,
      type: 'access',
      redirect_uri: data.redirect_uri,
      name: data.name,
      scope: data.scope
    }, lib.config.JWT, {
      expiresIn: lib.config.TOKENS.authTokenExpire
    });

    return {
      accessToken: accessToken
    };
  });
};

//CHECK: *newVendorAuthToken (user_id, holder) <accessToken> <redirect_uri> <[scope]>
oauth.newVendorAuthToken = function (auth, query) {
  return q.fcall(function () {
    //FILTER
    j.assert(query, {
      accessToken: j.string().required(),
      redirect_uri: j.string().required(),
      scope: j.array().items(j.string().valid(lib.config.TOKENS.vendor_scope).required()).unique().required()
    });

    //verify signature
    var decoded = jwt.verify(query.accessToken, lib.config.JWT);

    //verify token is access token
    j.assert(decoded.type, 'access');

    //verify the person making the request is the account owner
    if(auth.user_id !== auth.holder) throw 'must be account owner making request';

    //verify the person making the request is the accessToken holder
    if(auth.user_id !== decoded.holder) throw 'must be accessToken holder making request';

    //verify redirect_uri are the same
    if(query.redirect_uri !== decoded.redirect_uri) throw 'redirect_uri do not match';

    //verify scopes are the same
    if(!_.isEqual(query.scope.sort(), decoded.scope.sort())) throw 'scopes do not match';

    return {
      token_id: decoded.token_id,
      user_id: decoded.user_id,
      holder: decoded.holder,
      name: decoded.name,
      scope: decoded.scope
    };
  }).then(function (data) {
    //QUERY
    return knex('tokens')
    .insert({
      token_id: data.token_id,
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

//DONE: *newApiToken (user_id, holder) <name> <[scope]>
oauth.newApiToken = function (auth, query) {
  return q.fcall(function () {
    //FILTER
    j.assert(query, {
      name: j.string().max(100).required(),
      scope: j.array().items(j.string().valid(lib.config.TOKENS.api_scope).required()).unique().required()
    });

    //verify the person making the api key has the rights
    j.assert(auth.user_id, auth.holder);

    return {
      user_id: auth.user_id,
      holder: auth.user_id,
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
      type: 'api',
      name: data.name,
      scope: data.scope,
      expires: knex.raw("now() + (make_interval(secs => 1) * ?) ", [lib.config.TOKENS.apiTokenExpire])
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

    //create api token
    var apiToken = jwt.sign({
      token_id: data[0].token_id,
      user_id: data[0].user_id,
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

//CHECK: *getUserTokenInfo (user_id)
oauth.getUserTokenInfo = function (auth) {
  return q.fcall(function () {
    //FILTER
    return {
      user_id: auth.user_id
    };
  }).then(function (data) {
    //QUERY
    return knex('tokens')
    .select([
      'token_id',
      'user_id',
      'holder',
      'type',
      'name',
      'scope',
      'expires',
      'created_at'
    ])
    .where('user_id', '=', data.user_id)
    .orWhere('holder', '=', data.user_id)
    .orderBy('created_at', 'DESC');

  }).then(function (data) {
    //AFTER
    return data;
  });
};

//DONE: *deleteTokens (user_id) <[token_id]>
oauth.deleteTokens = function (auth, query) {
  return q.fcall(function () {
    //FILTER
    j.assert(query, {
      token_id: j.array().items(j.string().required()).required()
    });

    return {
      user_id: auth.user_id,
      token_id: query.token_id
    };
  }).then(function (data) {
    //QUERY
    return knex('tokens')
    .del()
    .whereIn('token_id', data.token_id)
    .where(function(p1) {
      p1.where('user_id', '=', data.user_id).orWhere('holder', '=', data.user_id)
    });

  }).then(function (data) {
    //AFTER
    return 'tokens deleted';
  });
};


module.exports = oauth;