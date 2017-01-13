const joi = require('joi');

module.exports.post = {
  body: {
    firstName: joy.string().label('First name').required().regex(/+\w/).trim(),
    lastName: joy.string().label('Last name').required().regex(/+\w/).trim(),
    email: joy.string().label('Email').required().email().trim(),
    password: joy.string().label('Password').trim().required().min(8)
  }
};
