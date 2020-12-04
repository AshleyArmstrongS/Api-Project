const mongoose = require('mongoose');
mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;

const FarmerSchema = new Schema({ 
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
    required: 'Email address is required' //put in validation here
  },
  password: {
    type: String,
    required: true
  },
  farm_type: {
    type: String,
    enum : ["BEEF", "DAIRY", "SUCKLER", "OTHER"],
    default: "Other"
  },
  farm_address: {
    type: String,
    required: true
  },
  medication_administrators: { // normally the farmer but can be the vet
    type: [String]
  },
  herd_number : {
    type: String,
    required: true,
    unique: true
  } // might need validation here
}, {collection: 'farmers'})

module.exports = mongoose.model('Farmer', FarmerSchema);