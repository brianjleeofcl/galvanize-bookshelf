'use strict';

const boom = require('boom');
const knex = require('../knex');
const bcrypt = require('bcrypt-as-promised');
const jwt = require('jsonwebtoken');
const express = require('express');
const { camelizeKeys } = require('humps');

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/token', (req, res) => {
  jwt.verify(req.cookies.token, process.env.JWT_KEY, (err, _) => {
    if (err) {
      return res.send(false);
    }

    res.send(true);
  });
});

router.post('/token', (req, res, next) => {
  let user;
  const { email, password } = req.body;

  if (!email) {
    throw boom.badRequest('Email must not be blank');
  }
  if (!password) {
    throw boom.badRequest('Password must not be blank');
  }

  knex('users').where('email', email).then((array) => {
    if (!array.length) {
      throw boom.badRequest('Bad email or password');
    }

    user = camelizeKeys(array[0]);

    return bcrypt.compare(password, user.hashedPassword);
  }).then(() => {
    delete user.hashedPassword;

    const claim = { userId: user.id };
    const token = jwt.sign(claim, process.env.JWT_KEY, {
      expiresIn: '7 days'
    });

    res.cookie('token', token, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 3600 * 24),
      secure: router.get('env') === 'Production'
    }).send(user);
  }).catch(bcrypt.MISMATCH_ERROR, () => {
    throw boom.badRequest('Bad email or password');
  }).catch((err) => next(err));
});

router.delete('/token', (req, res) => {
  res.clearCookie('token').send(false);
});

module.exports = router;
