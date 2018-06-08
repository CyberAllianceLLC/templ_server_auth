var q = require('q');
var _ = require('lodash');
var cron = require('cron').CronJob;

var lib = require('../index.js');
var knex = lib.config.DB;

//crons run by lead worker
if(process.env.DYNO === 'web.1'){

  //DONE: reset email_attempt and login_attempt (1 hour)
  new cron('0 1 * * * *', function() {
    q.fcall(function() {
      //SETTINGS
      console.log('===== RESET EMAIL AND LOGIN ATTEMPTS =====');

    }).then(function(data) {
      //CRON JOB
      //reset email and login attempts to 0
      return knex('users')
      .update({
        login_attempt: 0,
        email_attempt: 0
      })
      .where('login_attempt', '>', 0)
      .orWhere('email_attempt', '>', 0);

    }).then(function(data) {
      //SUCCESS
      console.log('===== SUCCESS RESET EMAIL AND LOGIN ATTEMPTS =====');
    }).catch(function(error) {
      //ERROR
      console.log('===== ERROR RESET EMAIL AND LOGIN ATTEMPTS =====');
    });
  }, null, true, 'America/Los_Angeles');

  //DONE: delete unverified new accounts (1 day)
  new cron('0 0 1 * * *', function() {
    q.fcall(function() {
      //SETTINGS
      console.log('===== DELETE UNVERIFIED ACCOUNTS =====');

    }).then(function(data) {
      //CRON JOB
      //delete unverified accounts older than a day
      return knex('users')
      .del()
      .where('verified', '=', false)
      .whereRaw('created_at < (now() - interval \'1 day\')');

    }).then(function(data) {
      //SUCCESS
      console.log('===== SUCCESS DELETE UNVERIFIED ACCOUNTS =====');
    }).catch(function(error) {
      //ERROR
      console.log('===== ERROR DELETE UNVERIFIED ACCOUNTS =====');
    });
  }, null, true, 'America/Los_Angeles');

  //DONE: delete expired tokens (1 day)
  new cron('0 0 1 * * *', function() {
    q.fcall(function() {
      //SETTINGS
      console.log('===== DELETE EXPIRED TOKENS =====');

    }).then(function(data) {
      //CRON JOB
      //delete expired oauth tokens
      return knex('tokens')
      .del()
      .whereRaw('expires < now()');

    }).then(function(data) {
      //SUCCESS
      console.log('===== SUCCESS DELETE EXPIRED TOKENS =====');
    }).catch(function(error) {
      //ERROR
      console.log('===== ERROR DELETE EXPIRED TOKENS =====');
    });
  }, null, true, 'America/Los_Angeles');

}

//crons run by all workers


