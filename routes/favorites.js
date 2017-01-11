'use strict';

const express = require('express');
const knex = require('../knex');
const jwt = require('jsonwebtoken');
const boom = require('boom');
const { camelizeKeys, decamelizeKeys } = require('humps');

// eslint-disable-next-line new-cap
const router = express.Router();

const authorize = function(req, res, next) {
  jwt.verify(req.cookies.token, process.env.JWT_KEY, (err, payload) => {
    if (err) {
      return next(boom.unauthorized());
    }

    req.claim = payload;

    next();
  });
};

router.get('/favorites', authorize, (req, res, next) =>
  knex('favorites').innerJoin('books', 'favorites.book_id', 'books.id')
    .where('user_id', req.claim.userId)
    .then((array) => res.send(camelizeKeys(array))).catch((err) => next(err))
);

router.get('/favorites/check?', authorize, (req, res, next) => {
  if (!req.query.bookId.match(/\d+/)) {
    return next(boom.badRequest('Book ID must be an integer'));
  }

  knex('favorites').innerJoin('books', 'favorites.book_id', 'books.id')
    .where('user_id', req.claim.userId).where('book_id', req.query.bookId)
    .then((array) => res.send(Boolean(array.length))).catch((err) => next(err));
});

router.post('/favorites', authorize, (req, res, next) => {
  const { bookId } = req.body;
  const userId = req.claim.userId;

  if (!String(bookId).match(/\d+/)) {
    return next(boom.badRequest('Book ID must be an integer'));
  }
  knex('books').where('id', bookId).then((array) => {
    if (!array.length) {
      throw boom.notFound('Book not found');
    }

    return knex('favorites').insert(decamelizeKeys({ bookId, userId }), '*');
  }).then((array) => res.send(camelizeKeys(array[0])))
    .catch((err) => next(err));
});

router.delete('/favorites', authorize, (req, res, next) => {
  const { bookId } = req.body;
  const userId = req.claim.userId;

  if (!String(bookId).match(/\d+/)) {
    return next(boom.badRequest('Book ID must be an integer'));
  }

  knex('books').where('id', bookId).then((array) => {
    if (!array.length) {
      throw boom.notFound('Favorite not found');
    }

    return knex('favorites').where('book_id', bookId).where('user_id', userId)
      .del('*');
  }).then((array) => {
    delete array[0].id;

    res.send(camelizeKeys(array[0]));
  }).catch((err) => next(err));
});

module.exports = router;
