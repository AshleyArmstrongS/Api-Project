const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;
const val = require("../models/mongoose_validation");

const AnimalSchema = new Schema(
  {
    tag_number: {
      type: Number,
      min: 10000,
      max: 99999,
      integer: true,
      trim: true,
      validate: [
        val.validateFiveDigitNumber,
        "Please give a tag number that is 5 in length.",
      ],
      required: true,
    },
    herd_number: {
      type: String,
      uppercase: true,
      trim: true,
      minlength: 10,
      maxlength: 11,
      validate: [
        val.validateHerdNumber,
        "Please use a valid herd number, format: IE 1234567 or 372 1234567",
      ],
      required: true,
    },
    sire_number: {
      type: Number,
      min: 10000,
      max: 99999,
      integer: true,
      trim: true,
      validate: [
        val.validateFiveDigitNumber,
        "Please give a sire number that is 5 in length.",
      ],
      required: true,
    },
    mother_number: {
      type: Number,
      min: 10000,
      max: 99999,
      integer: true,
      trim: true,
      validate: [
        val.validateFiveDigitNumber,
        "Please give a mother number that is 5 in length.",
      ],
      required: true,
    },
    male_female: {
      type: String,
      trim: true,
      enum: ["M", "F"],
      required: true,
    },
    breed_type: {
      type: String,
      trim: true,
      uppercase: true,
      required: true,
    },
    date_of_birth: {
      type: Date,
      trim: true,
      required: true,
    },
    pure_breed: {
      type: Boolean,
      trim: true,
      default: false,
    },
    cross_breed: {
      type: Boolean,
      trim: true,
      default: true,
    },
    animal_name: {
      type: String,
      trim: true,
      validate: [
        val.validateAnimalName,
        "Please give a tag number that is 5 in length.",
      ],
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    farmer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer",
      required: true,
    },
    groups_id: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Group",
    },
  },
  { collection: "animals" }
);

module.exports = mongoose.model("Animal", AnimalSchema);
