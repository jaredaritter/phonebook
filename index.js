require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');
const {
  isInPersons,
  unknownEndpoint,
  errorHandler,
} = require('./resources/helper_functions');

const app = express();

// ---------------------------------------
//  SETUP AND ENTRY MIDDLEWARE
// ---------------------------------------
app.use(express.static('build'));
app.use(cors());
app.use(express.json());

morgan.token('body', function getBody(req) {
  return JSON.stringify(req.body);
});
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
);

// ---------------------------------------
// ROUTES
// ---------------------------------------
app.get('/info', (req, res, next) => {
  Person.find({})
    .then((persons) => {
      const personsLength = persons.length;
      res.send(
        `<p>Phonebook has info for ${personsLength} people</p><p>${new Date()}</p>`
      );
    })
    .catch((error) => next(error));
});

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then((persons) => {
      res.json(persons);
    })
    .catch((error) => next(error));
});

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.post('/api/persons', (req, res, next) => {
  const body = req.body;

  if (!body.name) {
    return res.status(400).json({ error: 'Name required' });
  } else if (!body.number) {
    return res.status(400).json({ error: 'Number required' });
  }
  // WILL LIKELY NOT WORK DUE TO HAVING TO QUERY DB. WILL PROBABLY NEED AN AWAIT OR TO NEST THE SAVE FUNCTION IN SIDE THIS BLOCK. CURRENTLY BEING LIGHTLY BLOCKED BY CLIENT SIDE LOGIC. CAN STILL BE ACCESSED BY DIRECT QUERIES TO BACKEND.
  if (isInPersons(body.name)) {
    return res.status(400).json({ error: 'Name already in phonebook' });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      // REACT IS USING THE RETURNED OBJECT TO BUILD THE ELEMENT AND ASSIGN ITS KEY
      res.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then((updatedPerson) => {
      res.json(updatedPerson);
    })
    .catch((error) => next(error));
});

// ---------------------------------------
// RESPONSE MIDDLWARE
// ---------------------------------------
app.use(unknownEndpoint);
app.use(errorHandler);

// ---------------------------------------
// LISTENER
// ---------------------------------------
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

// ---------------------------------------
// DEPRECATED CODE
// ---------------------------------------
// PERSONS (DEPRECATED IN FAVOR OF MONGODB)
// let persons = [
//   {
//     id: 1,
//     name: 'Arto Hellas',
//     number: '040-123456',
//   },
//   {
//     id: 2,
//     name: 'Ada Lovelace',
//     number: '39-44-5323523',
//   },
//   {
//     id: 3,
//     name: 'Dan Abramov',
//     number: '12-43-234345',
//   },
//   {
//     id: 4,
//     name: 'Mary Poppendick',
//     number: '39-23-6423122',
//   },
// ];

// DEPRECATED, MONGODB IDS NOW USED FOR IDENTIFIERS
// const generateId = () => {
//   return Math.floor(Math.random() * 10000);
// };

// MIDDLEWARE FOR EXAMPLE. REPLACED WITH MORGAN PACKAGE
// const requestLogger = (req, res, next) => {
//   console.log('Method:', req.method);
//   console.log('Path:', req.path);
//   console.log('Body:', req.body);
//   console.log('----------------');
//   next();
// };
// app.use(requestLogger);

// HELPER FUNCTIONS, MOVED TO SEPERATE MODULE
// const isInPersons = (name) => {
//   Person.find({ name: name }).then((person) => {
//     return person ? true : false;
//   });
// };

// const unknownEndpoint = (req, res, next) => {
//   res.status(404).send({ error: 'unknown endpoint' });
// };

// const errorHandler = (err, req, res, next) => {
//   console.log('Name:', err.name);
//   console.log(err.message);

//   if (err.name === 'CastError') {
//     return res.status(400).end({ error: 'Malformed id' });
//   } else if (err.name === 'TypeError') {
//     return res.status(400).end({ error: 'Id wrong type' });
//   }

//   next(err);
// };
