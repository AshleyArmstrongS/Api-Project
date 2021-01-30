const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;

const validateTagNumber = tag_number => {
  const re = /^{5}$/
  return re.test(tag_number)
}

const AnimalSchema = new Schema(
  {
    tag_number: {
      type: Number,
      min:  10000,
      max: 99999,
      // validate:  {
      //   validater: function(v){
      //     var re = /^d{5}$/;
      //     return (v ==null || v.trim(v.length < 1) || re.test(v))
      //   },
      //   message: 'Provided number is invalid.'
      // },
      integer: true,
      trim: true,
      validate: [validateTagNumber, 'Please give a sire number that is 5 in length.'],
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
      required: "Please give a sire number that is 5 in length XXXXX.",
    },
    mother_number: {
      type: Number,
      min:  10000,
      max: 99999,
      integer: true,
      trim: true,
      required: "Please give a mother number that is 5 in length XXXXX.",
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
