const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;

const BreedSchema = new Schema({
  breed_name: {
    type: String,
    required: true,
  },
  breed_code: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Breed", BreedSchema);
