const Person = require('../models/person');

const isInPersons = (name) => {
  Person.find({ name: name }).then((person) => {
    return person ? true : false;
  });
};

const unknownEndpoint = (req, res, next) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (err, req, res, next) => {
  console.log('Name:', err.name);
  console.log(err.message);

  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'Malformed id' });
  } else if (err.name === 'TypeError') {
    return res.status(400).send({ error: 'Id wrong type' });
  } else if (err.name === 'ValidationError') {
    return res.status(400).send(err.message);
  }

  next(err);
};

module.exports = {
  isInPersons,
  unknownEndpoint,
  errorHandler,
};
