const _ = require('lodash');
const cron = require('cron').CronJob;

const lib = require('../index.js');
const knex = lib.config.DB;

//crons run by lead worker
if(process.env.DYNO === 'web.1'){

  //DONE: reset email_attempt and login_attempt (1 hour)
  new cron('0 1 * * * *', () => {
    //SETTINGS
    Promise.resolve().then(() => {
      console.log('===== RESET EMAIL AND LOGIN ATTEMPTS =====');
    })
    //CRON JOB
    //reset email and login attempts to 0
    .then((data) => {
      return knex('users')
      .update({
        login_attempt: 0,
        email_attempt: 0
      })
      .where('login_attempt', '>', 0)
      .orWhere('email_attempt', '>', 0);
    })
    //SUCCESS
    .then((data) => {
      console.log('===== SUCCESS RESET EMAIL AND LOGIN ATTEMPTS =====');
    })
    //ERROR
    .catch((error) => {
      console.log('===== ERROR RESET EMAIL AND LOGIN ATTEMPTS =====');
    });
  }, null, true, 'America/Los_Angeles');

  //DONE: delete unverified new accounts (1 day)
  new cron('0 0 1 * * *', () => {
    //SETTINGS
    Promise.resolve().then(() => {
      console.log('===== DELETE UNVERIFIED ACCOUNTS =====');
    })
    //CRON JOB
    //delete unverified accounts older than a day
    .then((data) => {
      return knex('users')
      .del()
      .where('verified', '=', false)
      .whereRaw('created_at < (now() - interval \'1 day\')');
    })
    //SUCCESS
    .then((data) => {
      console.log('===== SUCCESS DELETE UNVERIFIED ACCOUNTS =====');
    })
    //ERROR
    .catch((error) => {
      console.log('===== ERROR DELETE UNVERIFIED ACCOUNTS =====');
    });
  }, null, true, 'America/Los_Angeles');

  //DONE: delete expired tokens (1 day)
  new cron('0 0 1 * * *', () => {
    //SETTINGS
    Promise.resolve().then(() => {
      console.log('===== DELETE EXPIRED TOKENS =====');
    })
    //CRON JOB
    //delete expired oauth tokens
    .then((data) => {
      return knex('tokens')
      .del()
      .whereRaw('expires < now()');
    })
    //SUCCESS
    .then((data) => {
      console.log('===== SUCCESS DELETE EXPIRED TOKENS =====');
    })
    //ERROR
    .catch((error) => {
      console.log('===== ERROR DELETE EXPIRED TOKENS =====');
    });
  }, null, true, 'America/Los_Angeles');

}

//crons run by all workers


