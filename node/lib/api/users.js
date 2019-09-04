const j = require('@hapi/joi');
const shortid = require('shortid');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const lib = require('../index.js');
const knex = lib.config.DB;

const nm = nodemailer.createTransport(lib.config.SMTP);

let users = {};


//DONE: newUser <email> <password>
users.newUser = (query) => {
  //FILTER
  return Promise.resolve().then(() => {
    j.assert(query, {
      email: j.string().email().required(),
      password: j.string().min(6).required()
    });

    //create salt
    let salt = crypto.randomBytes(64).toString('base64');

    //create password hash
    let passwordHash = crypto.pbkdf2Sync(query.password, salt, 50000, 256, 'sha256').toString('base64');

    //create recovery key
    let recovery_key = crypto.randomBytes(64).toString('base64');

    return {
      email: query.email.toLowerCase(),
      salt: salt,
      password: passwordHash,
      recovery_key: recovery_key
    };
  })
  //QUERY
  .then((data) => {
    //create new user
    return knex('users')
    .insert({
      user_id: shortid.generate(),
      email: data.email,
      salt: data.salt,
      password: data.password,
      recovery_key: data.recovery_key
    })
    .returning([
      'user_id',
      'email',
      'recovery_key'
    ])
    //send verification email
    .then((user) => {
      j.assert(user, j.array().min(1).required());

      let user_id = user[0].user_id;
      let email = user[0].email;
      let recovery_key = user[0].recovery_key;

      //send email through SMTP
      return new Promise((resolve, reject) => {
        let mailOptions = {
          to: email,
          from: 'oauthexample <oauthexamplemail@gmail.com>',
          subject: 'Verify Email - oauthexample.com',
          text: 'An email verification has been requested for your oauthexample account. \n \n To verify your email for oauthexample, please visit this link: \n https://oauthexample.com/verifyNewEmail/'+ encodeURIComponent(user_id) +'/'+ encodeURIComponent(recovery_key) +'/'+ encodeURIComponent(email) + '\n \n Thank you for using oauthexample!'
        };
        nm.sendMail(mailOptions, (error, info) => {
          if(error){
            reject(error);
          }
          else{
            resolve(info);
          }
        });
      });
    });
  })
  //AFTER
  .then((data) => {
    return 'email sent';
  });
};

//DONE: loginUser (ip_address) <email> <password>
users.loginUser = (ip_address, query) => {
  //FILTER
  return Promise.resolve().then(() => {
    j.assert(query, {
      email: j.string().email().required(),
      password: j.string().min(6).required()
    });

    return {
      email: query.email.toLowerCase(),
      password: query.password
    };
  })
  //QUERY
  .then((data) => {
    //get password and salt of user
    return knex('users')
    .select([
      'user_id',
      'salt',
      'password'
    ])
    .where('verified', '=', true)
    .where('email', '=', data.email)
    .where('login_attempt', '<=', 6)
    //verify password
    .then((user) => {
      //not empty
      j.assert(user, j.array().min(1).required());

      //recreate password hash, with password and salt
      let passwordHash = crypto.pbkdf2Sync(data.password, user[0].salt, 50000, 256, 'sha256').toString('base64');

      //check if user hash matches
      //passwords match
      if(user[0].password === passwordHash){
        return [{
          user_id: user[0].user_id
        }];
      }
      //passwords don't match
      else{
        return knex('users')
        .update({
          login_attempt: knex.raw('login_attempt + 1')
        })
        .where('user_id', '=', user[0].user_id)
        .then(() => {
          throw new Error('login failed');
        });
      }
    });
  })
  //AFTER
  .then((data) => {
    j.assert(data, j.array().min(1).required());

    //create new refresh token
    return lib.util.newRefreshToken({
      user_id: data[0].user_id,
      holder: data[0].user_id,
      name: ip_address,
      scope: lib.config.TOKENS.user_scope
    });
  });
};

//DONE: sendRecoveryEmail <email>
users.sendRecoveryEmail = (query) => {
  //FILTER
  return Promise.resolve().then(() => {
    j.assert(query, {
      email: j.string().email().required()
    });

    return {
      email: query.email.toLowerCase()
    };
  })
  //QUERY
  .then((data) => {
    //increment email_attempt and prevent too many emails
    return knex('users')
    .update({
      email_attempt: knex.raw('email_attempt + 1')
    })
    .where('email', '=', data.email)
    .where('email_attempt', '<=', 6)
    .returning([
      'user_id',
      'email',
      'recovery_key'
    ])
    //send email
    .then((user) => {
      j.assert(user, j.array().min(1).required());

      let user_id = user[0].user_id;
      let email = user[0].email;
      let recovery_key = user[0].recovery_key;

      //send email through SMTP
      return new Promise((resolve, reject) => {
        let mailOptions = {
          to: email,
          from: 'oauthexample <oauthexamplemail@gmail.com>',
          subject: 'Account Recovery - oauthexample.com',
          text: 'A password reset has been requested for your oauthexample account. \n \n If you did not make this request, you can safely ignore this email. A password reset request can be made by anyone, and it does not indicate that your account is in any danger of being accessed by someone else. \n \n If you do actually want to reset your password, visit this link: \n https://oauthexample.com/verifyRecoveryEmail/'+ encodeURIComponent(user_id) +'/'+ encodeURIComponent(recovery_key) + '\n \n Thank you for using oauthexample!'
        };
        nm.sendMail(mailOptions, (error, info) => {
          if(error){
            reject(error);
          }
          else{
            resolve(info);
          }
        });
      });
    });
  })
  //AFTER
  .then((data) => {
    return 'email sent';
  });
};

//DONE: verifyRecoveryEmail (ip_address) <user_id> <new_password> <recovery_key>
users.verifyRecoveryEmail = (ip_address, query) => {
  //FILTER
  return Promise.resolve().then(() => {
    j.assert(query, {
      user_id: j.string().required(),
      new_password: j.string().min(6).required(),
      recovery_key: j.string().required()
    });

    //create new salt
    let new_salt = crypto.randomBytes(64).toString('base64');

    //create new password hash
    let new_passwordHash = crypto.pbkdf2Sync(query.new_password, new_salt, 50000, 256, 'sha256').toString('base64');

    //create new recovery key
    let new_recovery_key = crypto.randomBytes(64).toString('base64');

    return {
      user_id: query.user_id,
      recovery_key: query.recovery_key,
      new_salt: new_salt,
      new_password: new_passwordHash,
      new_recovery_key: new_recovery_key
    };
  })
  //QUERY
  .then((data) => {
    //verify recovery key
    return knex('users')
    .update({
      verified: true,
      salt: data.new_salt,
      password: data.new_password,
      recovery_key: data.new_recovery_key,
      updated_at: knex.raw('now()')
    })
    .where('user_id', '=', data.user_id)
    .where('recovery_key', '=', data.recovery_key)
    .returning([
      'user_id'
    ]);
  })
  //AFTER
  .then((user) => {
    j.assert(user, j.array().min(1).required());

    //delete old session tokens
    return lib.util.deleteAllSessions({user_id: user[0].user_id}).then(() => {
      //create new refresh token
      return lib.util.newRefreshToken({
        user_id: user[0].user_id,
        holder: user[0].user_id,
        name: ip_address,
        scope: lib.config.TOKENS.user_scope
      });
    });
  });
};

//DONE: *getUserInfo (user_id)
users.getUserInfo = (auth) => {
  //FILTER
  return Promise.resolve().then(() => {
    return {
      user_id: auth.user_id
    };
  })
  //QUERY
  .then((data) => {
    //get user info
    return knex('users')
    .select([
      'user_id',
      'email',
      'updated_at',
      'created_at'
    ])
    .where('user_id', '=', data.user_id);
  })
  //AFTER
  .then((data) => {
    j.assert(data, j.array().min(1).required());
    return data[0];
  });
};

//DONE: *newEmail (user_id) <email>
users.newEmail = (auth, query) => {
  //FILTER
  return Promise.resolve().then(() => {
    j.assert(query, {
      email: j.string().email().required()
    });

    return {
      user_id: auth.user_id,
      email: query.email.toLowerCase()
    };
  })
  //QUERY
  .then((data) => {
    //get user
    return knex('users')
    .update({
      email_attempt: knex.raw('email_attempt + 1')
    })
    .where('user_id', '=', data.user_id)
    .where('email_attempt', '<=', 6)
    .returning([
      'user_id',
      'recovery_key'
    ])
    //send email
    .then((user) => {
      j.assert(user, j.array().min(1).required());

      let user_id = user[0].user_id;
      let email = data.email;
      let recovery_key = user[0].recovery_key;

      //send email through SMTP
      return new Promise((resolve, reject) => {
        let mailOptions = {
          to: email,
          from: 'oauthexample <oauthexamplemail@gmail.com>',
          subject: 'Verify Email - oauthexample',
          text: 'An email verification has been requested for your oauthexample account. \n \n To verify your email for oauthexample, please visit this link: \n https://oauthexample.com/verifyNewEmail/'+ encodeURIComponent(user_id) +'/'+ encodeURIComponent(recovery_key) +'/'+ encodeURIComponent(email) + '\n \n Thank you for using oauthexample!'
        };
        nm.sendMail(mailOptions, (error, info) => {
          if(error){
            reject(error);
          }
          else{
            resolve(info);
          }
        });
      });
    });
  })
  //AFTER
  .then((data) => {
    return 'email sent';
  });
};

//DONE: verifyNewEmail <user_id> <new_email> <recovery_key>
users.verifyNewEmail = (query) => {
  //FILTER
  return Promise.resolve().then(() => {
    j.assert(query, {
      user_id: j.string().required(),
      new_email: j.string().email().required(),
      recovery_key: j.string().required()
    });

    return {
      user_id: query.user_id,
      new_email: query.new_email.toLowerCase(),
      recovery_key: query.recovery_key
    };
  })
  //QUERY
  .then((data) => {
    return knex('users')
    .update({
      email: data.new_email,
      verified: true,
      recovery_key: crypto.randomBytes(64).toString('base64'),
      updated_at: knex.raw('now()')
    })
    .where('user_id', '=', data.user_id)
    .where('recovery_key', '=', data.recovery_key)
    .returning(['user_id']);
  })
  //AFTER
  .then((data) => {
    j.assert(data, j.array().min(1).required());
    //delete old session tokens
    return lib.util.deleteAllSessions({user_id: data[0].user_id}).then(() => {
      return 'email updated';
    });
  });
};

//DONE: *newPassword (ip_address) (user_id) <password> <new_password>
users.newPassword = (ip_address, auth, query) => {
  //FILTER
  return Promise.resolve().then(() => {
    j.assert(query, {
      password: j.string().min(6).required(),
      new_password: j.string().min(6).required()
    });

    //create new salt
    let new_salt = crypto.randomBytes(64).toString('base64');

    //create new password hash
    let new_passwordHash = crypto.pbkdf2Sync(query.new_password, new_salt, 50000, 256, 'sha256').toString('base64');

    //create new recovery key
    let new_recovery_key = crypto.randomBytes(64).toString('base64');

    return {
      user_id: auth.user_id,
      password: query.password,
      new_salt: new_salt,
      new_password: new_passwordHash,
      new_recovery_key: new_recovery_key
    };
  })
  //QUERY
  .then((data) => {
    //get user salt
    return knex('users')
    .select([
      'salt'
    ])
    .where('user_id', '=', data.user_id)
    .then((user) => {
      j.assert(user, j.array().min(1).required());

      //recreate password hash, with password and salt
      let passwordHash = crypto.pbkdf2Sync(data.password, user[0].salt, 50000, 256, 'sha256').toString('base64');

      //update user
      return knex('users')
      .update({
        salt: data.new_salt,
        password: data.new_password,
        recovery_key: data.new_recovery_key,
        updated_at: knex.raw('now()')
      })
      .where('user_id', '=', data.user_id)
      .where('password', '=', passwordHash)
      .returning([
        'user_id'
      ]);
    });
  })
  //AFTER
  .then((data) => {
    j.assert(data, j.array().min(1).required());

    //delete old session tokens
    return lib.util.deleteAllSessions({user_id: data[0].user_id}).then(() => {
      //create and return new refresh token
      return lib.util.newRefreshToken({
        user_id: data[0].user_id,
        holder: data[0].user_id,
        name: ip_address,
        scope: lib.config.TOKENS.user_scope
      });
    });
  });
};

//DONE: *deleteUser (user_id) <password>
users.deleteUser = (auth, query) => {
  //FILTER
  return Promise.resolve().then(() => {
    j.assert(query, {
      password: j.string().min(6).required()
    });

    return {
      user_id: auth.user_id,
      password: query.password
    };
  })
  //QUERY
  .then((data) => {
    //get user salt
    return knex('users')
    .select([
      'salt'
    ])
    .where('user_id', '=', data.user_id)
    .then((user) => {
      //not empty
      j.assert(user, j.array().min(1).required());

      //recreate password hash, with password and salt
      let passwordHash = crypto.pbkdf2Sync(data.password, user[0].salt, 50000, 256, 'sha256').toString('base64');

      //delete user
      return knex('users')
      .del()
      .where('user_id', '=', data.user_id)
      .where('password', '=', passwordHash)
      .returning(['user_id'])
    });
  })
  //AFTER
  .then((data) => {
    j.assert(data, j.array().min(1).required());
    return 'user deleted';
  });
};


module.exports = users;