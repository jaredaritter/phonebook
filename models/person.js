const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// --------------------------------------
// MONGODB CONNECTION
// --------------------------------------
const url = process.env.MONGODB_URI;

console.log('connecting to DB url');

mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then((result) => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connecting to MongoDB', error.message);
  });

// --------------------------------------
// MONGOOSE SCHEMA AND MODEL
// --------------------------------------
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  number: {
    type: String,
  },
});
personSchema.plugin(uniqueValidator);

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Person', personSchema);
