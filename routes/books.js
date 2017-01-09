'use strict';

const { camelizeKeys, decamelizeKeys } = require('humps');
const express = require('express');
const knex = require('../knex');

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/books', (_, res, next) => {
  knex('books').orderBy('title').then((array) => {
    res.send(camelizeKeys(array));
  }).catch((err) => next(err));
});

router.get('/books/:id', (req, res, next) => {
  if (!req.params.id.match(/\d+/)) {
    return next();
  }
  knex('books').where('id', req.params.id).then((array) => {
    if (!array.length) {
      return next();
    }
    res.send(camelizeKeys(array[0]));
  }).catch((err) => next(err));
});

router.post('/books', (req, res, next) => {
  for (const key in req.body) {
    if (req.body[key] === '' || typeof req.body[key] === 'undefined') {
      delete req.body[key];
    }
  }

  const missing = [
    'title',
    'author',
    'genre',
    'description',
    'coverUrl'
  ].filter((key) => !Object.keys(req.body).includes(key));

  if (missing.length) {
    const message = {
      title: 'Title',
      author: 'Author',
      genre: 'Genre',
      description: 'Description',
      coverUrl: 'Cover URL'
    };
    const err = new Error(`${message[missing[0]]} must not be blank`);

    err.output = {};
    err.output.statusCode = 400;

    throw err;
  }
  knex('books').insert(decamelizeKeys(req.body), '*').then((array) => {
    res.send(camelizeKeys(array[0]));
  }).catch((err) => next(err));
});

router.patch('/books/:id', (req, res, next) => {
  if (!req.params.id.match(/\d+/)) {
    return next();
  }
  knex('books').where('id', req.params.id).then((data) => {
    if (!data.length) {
      return next();
    }
    knex('books').where('id', req.params.id)
      .update(decamelizeKeys(req.body), '*').then((array) => {
        res.send(camelizeKeys(array[0]));
      });
  }).catch((err) => next(err));
});

router.delete('/books/:id', (req, res, next) => {
  if (!req.params.id.match(/\d+/)) {
    return next();
  }
  knex('books').where('id', req.params.id).del('*').then((array) => {
    if (!array.length) {
      return next();
    }
    delete array[0].id;
    res.send(camelizeKeys(array[0]));
  }).catch((err) => next(err));
});

module.exports = router;
