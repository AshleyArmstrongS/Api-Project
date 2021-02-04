const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;
const val = require("../models/mongoose_validation");

const BreedSchema = new Schema({
  breed_name: {
    type: String,
    trim: true,
    uppercase: true,
    validate: [val.validateBreedName, 'Invalid, please enter valid breed name'],
    required: true,
  },
  breed_code: {
    type: String,
    trim: true,
    uppercase: true,
    validate: [val.validateBreedCode, 'Invalid, code must be 2-4 in length'],
    required: true,
  },
});

module.exports = mongoose.model("Breed", BreedSchema);
