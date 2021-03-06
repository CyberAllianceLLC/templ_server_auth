const knex = require('knex')({
  client: 'pg',
  connection: ((process.env['DSN']) ? process.env['DSN'] : 'postgres://postgres:@db:5432/postgres'),
  debug: true
});

//===== MODELS =====
//DONE: initialize
Promise.resolve().then(() => {
  return knex.raw('CREATE EXTENSION pg_trgm'); //search module
})
//DONE: users
.then((data) => {
  return knex.schema.createTable('users', (table) => {
    table.string('user_id', 15).notNullable().primary().unique();
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
})
//DONE: tokens
.then((data) => {
  return knex.schema.createTable('tokens', (table) => {
    table.string('token_id', 15).notNullable().primary().unique();
    table.string('user_id', 15).notNullable().references('users.user_id').onDelete('CASCADE').index();
    table.string('holder', 15).notNullable().references('users.user_id').onDelete('CASCADE').index();
    table.enu('type', ['refresh', 'api']).notNullable();
    table.string('name', 100).notNullable();
    table.specificType('scope', 'varchar(50)[]').notNullable().defaultTo('{}');
    table.timestamp('expires').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()')).index();
  });
})
//DONE: EXIT
.then(() => {
  process.exit(0);
})
.catch(() => {
  process.exit(0);
});
