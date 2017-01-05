'use strict';

const express = require('express');
const knex = require('../knex')

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/books', (req, res, next) => {
  knex('books').orderBy('id').then((array) => {
    res.send(array);
  }).catch(err => next(err));
});

router.get();

router.post();

router.patch();

router.delete();

module.exports = router;
