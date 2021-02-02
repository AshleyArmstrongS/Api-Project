const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;

const validateFiveDigitNumber = tag_number => {
  const re = /^d{5}$/
  return re.test(tag_number)
}
const validateHerdNumber = herd_number => {
  const re = /^[a-zA-Z{2}0-9{3}_.-]*$/
  return re.test(herd_number)
}
const validateAnimalName = animal_name => {
  const re = /^[a-zA-Z]*$/
  return re.test(animal_name)
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
      minlength: 9,
      maxlength: 10,
      uppercase: true,
      validate: [validateHerdNumber, 'Please use a valid herd number, format: IE1234567 or 3721234567'],
      required: true,
    },
    sire_number: {
      type: Number,
      min:  10000,
      max: 99999,
      integer: true,
      trim: true,
      validate: [validateFiveDigitNumber, "Please give a sire number that is 5 in length."],
      required: true,
    },
    mother_number: {
      type: Number,
      min:  10000,
      max: 99999,
      integer: true,
      trim: true,
      validate: [validateFiveDigitNumber, "Please give a mother number that is 5 in length."],
      required: true,
    },
    male_female: {
      type: String,
      trim: true,
      enum: ["M", "F"],
      required: true
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
      default: true
    },
    animal_name: {
      type: String,
      trim: true,
      validate: [validateAnimalName, 'Please give a tag number that is 5 in length.'],
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
