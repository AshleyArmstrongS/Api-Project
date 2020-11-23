const mongoose = require('mongoose');
mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;

var Farmer = new Schema({ // might be worth to check out autoincrement for _id
  first_name: {
    type: String,
    required: true,
    validate: /\S+/
  },
  second_name: {
    type: String,
    required: true,
    validate: /\S+/
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: 'Email address is required', //put in validation here
    //validate: [validateEmail, 'Please fill a valid email address'],
    //match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: true
  },
  farm_type: {
    type: String,
    enum : ['Beef', 'Dairy', "Suckler", "Other"],
    default: ''
  },
  farm_address: {
    type: String,
    required: true
  },
  //vet: {
  //  type: String
  //},
  herd_number : {
    type: String,
    required: true,
    unique: true
  } // might need validation here
}, {collection: 'farmers'})

  module.exports = mongoose.model('Farmer', Farmer);