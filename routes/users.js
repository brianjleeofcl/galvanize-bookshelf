'use strict';

const { camelizeKeys, decamelizeKeys } = require('humps');
const express = require('express');
const knex = require('../knex');
const bcrypt = require('bcrypt-as-promised');
const boom = require('boom');
const jwt = require('jsonwebtoken');

// eslint-disable-next-line new-cap
const router = express.Router();

// YOUR CODE HERE

router.post('/users', (req, res, next) => {
  let user;
  const { firstName, lastName, email, password } = camelizeKeys(req.body);

  if (!email) {
    throw boom.badRequest('Email must not be blank');
  }
  if (!password || password.length < 8) {
    throw boom.badRequest('Password must be at least 8 characters long');
  }
  knex('users').where('email', email).then((data) => {
    if (data.length) {
      throw next(boom.badRequest('Email already exists'));
    }

    return bcrypt.hash(password, 12)
  }).then((hashedPassword) => {
    user = { firstName, lastName, email, hashedPassword };

    return knex('users').insert(decamelizeKeys(user), '*')
  }).then((array) => {
    delete user.hashedPassword;
    user.id = array[0].id;

    const claim = {userId: user.id};
    const token = jwt.sign(claim, process.env.JWT_KEY, {
      expiresIn: '7 days'
    })

    res.cookie('token', token, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 3600 * 24),
      secure: router.get('env') === 'Production'
    }).send(user);
  }).catch((error) => next(error));
});

module.exports = router;
