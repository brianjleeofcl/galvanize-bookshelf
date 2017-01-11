'use strict';

const { camelizeKeys, decamelizeKeys } = require('humps');
const express = require('express');
const knex = require('../knex');
const boom = require('boom');

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/books', (_, res, next) => knex('books').orderBy('title')
  .then((array) => res.send(camelizeKeys(array))).catch((err) => next(err)));

router.get('/books/:id', (req, res, next) => {
  if (!req.params.id.match(/\d+/)) {
    return next(boom.notFound());
  }

  knex('books').where('id', req.params.id).then((array) => {
    if (!array.length) {
      throw boom.notFound();
    }

    res.send(camelizeKeys(array[0]));
  }).catch((err) => next(err));
});

router.post('/books', (req, res, next) => {
  const { title, author, genre, description, coverUrl } = req.body;
  const row = { title, author, genre, description, coverUrl };

  for (const key in row) {
    if (!row[key]) {
      delete row[key];
    }
  }

  const missing = [
    'title',
    'author',
    'genre',
    'description',
    'coverUrl'
  ].filter((key) => !Object.keys(row).includes(key));

  if (missing.length) {
    const message = {
      title: 'Title',
      author: 'Author',
      genre: 'Genre',
      description: 'Description',
      coverUrl: 'Cover URL'
    };

    return next(boom.badRequest(`${message[missing[0]]} must not be blank`));
  }

  knex('books').insert(decamelizeKeys(row), '*')
    .then((array) => res.send(camelizeKeys(array[0])))
    .catch((err) => next(err));
});

router.patch('/books/:id', (req, res, next) => {
  const { title, author, genre, description, coverUrl } = req.body;
  const row = { title, author, genre, description, coverUrl };

  if (!req.params.id.match(/\d+/)) {
    return next(boom.notFound());
  }
  knex('books').where('id', req.params.id).then((data) => {
    if (!data.length) {
      throw boom.notFound();
    }

    return knex('books').where('id', req.params.id)
      .update(decamelizeKeys(row), '*');
  }).then((array) => res.send(camelizeKeys(array[0])))
    .catch((err) => next(err));
});

router.delete('/books/:id', (req, res, next) => {
  if (!req.params.id.match(/\d+/)) {
    return next(boom.notFound());
  }
  knex('books').where('id', req.params.id).del('*').then((array) => {
    if (!array.length) {
      throw boom.notFound();
    }

    delete array[0].id;
    res.send(camelizeKeys(array[0]));
  }).catch((err) => next(err));
});

module.exports = router;
