'use strict';

const { camelizeKeys, decamelizeKeys } = require('humps');
const express = require('express');
const knex = require('../knex');
const bcrypt = require('bcrypt-as-promised');
const boom = require('boom');

// eslint-disable-next-line new-cap
const router = express.Router();

// YOUR CODE HERE

router.post('/users', (req, res, next) => {
  if (req.body.email) {
    if (req.body.password && req.body.password.length >= 8) {
      knex('users').where('email', req.body.email).then((data) => {
        if (data.length) {
          throw next(boom.badRequest('Email already exists'));
        }

        return bcrypt.hash(req.body.password, 12)
      }).then((hashed) => {
        delete req.body.password;
        req.body.hashedPassword = hashed;
        return knex('users').insert(decamelizeKeys(req.body), '*')
      }).then((array) => {
        delete array[0]['hashed_password'];
        res.send(camelizeKeys(array[0]));
      }).catch((error) => next(error));
    }
    else {
      return next(boom.badRequest('Password must be at least 8 characters long'));
    }
  }
  else {
    return next(boom.badRequest('Email must not be blank'));
  }
});

module.exports = router;
