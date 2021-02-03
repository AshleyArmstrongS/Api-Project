const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;

const validateBreedName = name => {
  const re = /^[a-zA-Z ]{2,30}$/
  return re.test(name) 
}

const validateBreedCode = breed_code => {
  const re = /^[a-zA-Z0-9]{2,4}$/
  return re.test(breed_code)
}

const BreedSchema = new Schema({
  breed_name: {
    type: String,
    trim: true,
    uppercase: true,
    validate: [validateBreedName, 'Invalid, please enter valid breed name'],
    required: true,
  },
  breed_code: {
    type: String,
    trim: true,
    uppercase: true,
    validate: [validateBreedCode, 'Invalid, code must be 2-4 in length'],
    required: true,
  },
});

module.exports = mongoose.model("Breed", BreedSchema);
