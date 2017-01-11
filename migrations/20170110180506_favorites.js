'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('favorites', (table) => {
    table.increments();
    table.integer('book_id').notNullable()
      .references('id').inTable('books').onDelete('cascade').index();
    table.integer('user_id').notNullable()
      .references('id').inTable('users').onDelete('cascade').index();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('favorites');
};
