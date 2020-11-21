const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const initial = new Schema({

  })

  var AnimalSchema = new Schema({
    tag_number: { // need some clarification on this
      type: Number,
      required: true
      // unique: true,
      // integer: true
    },
    herd_number : {
      type: String,
      required: true,
      unique: true
    }, // might need validation here
    sire_number: {
      type: Number,
      required: true
    },
    mother_number: {
      type: Number,
      required: true
    },
    male_female: {
      enum: ['M', 'F']
    },
    breed_type: {
      type: String,
      required: true
    },
    date_of_birth: {
      type: Date,
      required: true
    },
    pure_breed: {
      type: Boolean,
      default: false
    },
    animal_name: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    farmer_id: {
      type: Number,
      required: true
    }
  })