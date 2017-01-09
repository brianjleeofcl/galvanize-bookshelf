'use strict';

const knex = require('../knex');
const boom = require('boom');

const check = function(knexObj, body, requirements) {
  knex.raw(`select column_name from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME = '${knexObj._single.table}' AND is_nullable = 'NO' AND data_type <> 'timestamp with time zone';`).then((array) => {
    const keys = array.rows.map(obj => obj.column_name).filter(key => key !== 'id')

    for (const key of keys) {
      if (!requirements[key](body[key])) {
        return boom.badRequest(requirements.errorText[key]);
      }
    }
  })
};

check(knex('users'), {first_name: 'hi', last_name: 'lo', email:'ss', hashed_password: 'aa'}, {
  first_name(value) {return value.length > 0},
  last_name(value) {return value.length > 0},
  email(value) {return value.length > 0},
  hashed_password(value) {return value.length > 8},
  errorText: {
    first_name: '',
    last_name: '',
    email: 'Email must not be blank',
    hashed_password: 'Password must be at least 8 characters long'}
});



module.exports = check;
