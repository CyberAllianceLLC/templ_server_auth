const _ = require('lodash');
const cron = require('cron').CronJob;

const lib = require('../index.js');
const knex = lib.config.DB;

//crons run by lead worker
if(process.env.DYNO === 'web.1'){

  //DONE: reset email_attempt and login_attempt (1 hour)
  new cron('0 1 * * * *', () => {
    Promise.resolve().then(() => {
      //SETTINGS
      console.log('===== RESET EMAIL AND LOGIN ATTEMPTS =====');

    }).then((data) => {
      //CRON JOB
      //reset email and login attempts to 0
      return knex('users')
      .update({
        login_attempt: 0,
        email_attempt: 0
      })
      .where('login_attempt', '>', 0)
      .orWhere('email_attempt', '>', 0);

    }).then((data) => {
      //SUCCESS
      console.log('===== SUCCESS RESET EMAIL AND LOGIN ATTEMPTS =====');
    }).catch((error) => {
      //ERROR
      console.log('===== ERROR RESET EMAIL AND LOGIN ATTEMPTS =====');
    });
  }, null, true, 'America/Los_Angeles');

  //DONE: delete unverified new accounts (1 day)
  new cron('0 0 1 * * *', () => {
    Promise.resolve().then(() => {
      //SETTINGS
      console.log('===== DELETE UNVERIFIED ACCOUNTS =====');

    }).then((data) => {
      //CRON JOB
      //delete unverified accounts older than a day
      return knex('users')
      .del()
      .where('verified', '=', false)
      .whereRaw('created_at < (now() - interval \'1 day\')');

    }).then((data) => {
      //SUCCESS
      console.log('===== SUCCESS DELETE UNVERIFIED ACCOUNTS =====');
    }).catch((error) => {
      //ERROR
      console.log('===== ERROR DELETE UNVERIFIED ACCOUNTS =====');
    });
  }, null, true, 'America/Los_Angeles');

  //DONE: delete expired tokens (1 day)
  new cron('0 0 1 * * *', () => {
    Promise.resolve().then(() => {
      //SETTINGS
      console.log('===== DELETE EXPIRED TOKENS =====');

    }).then((data) => {
      //CRON JOB
      //delete expired oauth tokens
      return knex('tokens')
      .del()
      .whereRaw('expires < now()');

    }).then((data) => {
      //SUCCESS
      console.log('===== SUCCESS DELETE EXPIRED TOKENS =====');
    }).catch((error) => {
      //ERROR
      console.log('===== ERROR DELETE EXPIRED TOKENS =====');
    });
  }, null, true, 'America/Los_Angeles');

}

//crons run by all workers


