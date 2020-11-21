const mongoose = require('mongoose');
const Schema = mongoose.Schema;

  const Animal = new Schema({
    tag_number: { // need some clarification on this
      type: Number,
      required: true
      // unique: true,
      // integer: true
    }
  })


  module.exports = mongoose.model('Animal', Animal);