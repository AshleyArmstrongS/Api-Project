const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;

const AnimalSchema = new Schema(
  {
    tag_number: {
      type: Number,
      required: true,
      integer: true,
    },
    herd_number: {
      type: String,
      required: true,
    },
    sire_number: {
      type: Number,
      required: true,
    },
    mother_number: {
      type: Number,
      required: true,
    },
    male_female: {
      type: String,
      enum: ["M", "F"],
    },
    breed_type: {
      //type: mongoose.Schema.Types.ObjectId,
      //ref: "Breed"
      type: String,
    },
    date_of_birth: {
      type: Date,
      required: true,
    },
    pure_breed: {
      type: Boolean,
      default: false,
    },
    cross_breed: {
      type: Boolean,
    },
    animal_name: {
      type: String,
      default: "",
    },
    description: {
      type: String,
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
