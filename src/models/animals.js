const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;

const validateFiveDigitNumber = tag_number => {
  const re = /^d{5}$/
  return re.test(tag_number)
}

const AnimalSchema = new Schema(
  {
    tag_number: {
      type: Number,
      min:  10000,
      max: 99999,
      integer: true,
      trim: true,
      validate: [validateFiveDigitNumber, 'Please give a tag number that is 5 in length.'],
      required: true,
    },
    herd_number: {
      type: String,
      uppercase: true,
      trim: true,
      minlength: 8,
      maxlength: 8,
      required: true,
    },
    sire_number: {
      type: Number,
      min:  10000,
      max: 99999,
      integer: true,
      trim: true,
      required: [validateFiveDigitNumber, "Please give a sire number that is 5 in length."],
    },
    mother_number: {
      type: Number,
      min:  10000,
      max: 99999,
      integer: true,
      trim: true,
      required: [validateFiveDigitNumber, "Please give a mother number that is 5 in length."]
    },
    male_female: {
      type: String,
      trim: true,
      enum: ["M", "F"],
      required: "Animal must have a gender."
    },
    breed_type: {
      //type: mongoose.Schema.Types.ObjectId,
      //ref: "Breed"
      type: String,
      trim: true,
    },
    date_of_birth: {
      type: Date,
      required: "Date of birth is required",
    },
    pure_breed: {
      type: Boolean,
      default: false,
    },
    cross_breed: {
      type: Boolean,
      default: true
    },
    animal_name: {
      type: String,
      trim: true,
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
       ref: "Group"
     }
  },
  { collection: "animals" }
);

module.exports = mongoose.model("Animal", AnimalSchema);
