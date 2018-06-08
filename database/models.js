var q = require('q');

var knex = require('knex')({
  client: 'pg',
  connection: ((process.env['DSN']) ? process.env['DSN'] : 'postgres://postgres:@db:5432/postgres'),
  debug: true
});

//===== MODELS =====
q.fcall(function() {
  //DONE: initialize
  return knex.raw('CREATE EXTENSION pg_trgm'); //search module
}).then(function (data) {
  //DONE: users
  return knex.schema.createTable('users', function(table) {
    table.string('u_id', 15).notNullable().primary().unique();
    table.string('email', 50).notNullable().unique().index();
    table.boolean('verified').notNullable().defaultTo(false);
    table.string('salt', 100).notNullable();
    table.string('password', 400).notNullable();
    table.string('recovery_key', 100).notNullable();
    table.integer('login_attempt').notNullable().defaultTo(0);
    table.integer('email_attempt').notNullable().defaultTo(0);
    table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));
    table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()')).index();
  });
}).then(function (data) {
  //DONE: tokens
  return knex.schema.createTable('tokens', function(table) {
    table.string('t_id', 15).notNullable().primary().unique();
    table.string('u_id', 15).notNullable().references('users.u_id').onDelete('CASCADE').index();
    table.string('holder', 15).notNullable().references('users.u_id').onDelete('CASCADE').index();
    table.enu('type', ['refresh', 'api']).notNullable();
    table.string('name', 100).notNullable();
    table.specificType('scope', 'varchar(50)[]').notNullable().defaultTo('{}');
    table.timestamp('expires').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()')).index();
  });
}).finally(function() {
  process.exit(0);
});
