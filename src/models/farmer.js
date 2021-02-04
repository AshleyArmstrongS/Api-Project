const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;

const validateIsName = name => {
  const re = /^[a-zA-Z ]{2,30}$/
  re.test(name) 
  return re
}

// https://stackoverflow.com/questions/18022365/mongoose-validate-email-syntax
var validateEmail = function(email) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  re.test(email)
  return re
};

const validateHerdNumber = herd_number => {
  const re = /^[a-zA-Z0-9{10}]$/
  re.test(herd_number)
  return re
}

const FarmerSchema = new Schema(
  {
    first_name: {
      type: String,
      trim: true,
      validate: [validateIsName, 'Invalid, use all letters, max length of 30'],
      required: true,
    },
    second_name: {
      type: String,
      trim: true,
      validate: [validateIsName, 'Invalid, use all letters, max length of 30'],
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      validate: [validateEmail, 'Please fill a valid email address'],
      required: "Email address is required", 
    },
    password: {
      type: String,
      trim: true,
      required: true,
    },
    farm_type: {
      type: String,
      trim: true,
      enum: ["BEEF", "DAIRY", "SUCKLER", "OTHER"],
      default: "Other",
    },
    farm_address: {
      type: String,
      trim: true,
      required: true,
    },
    medication_administrators: {
      type: [String],
      trim: true,
    },
    herd_number: {
      type: String,
      uppercase: true,
      trim: true,
      minlength: 10,
      maxlength: 11,
      validate: [validateHerdNumber, 'Please use a valid herd number, format: IE 1234567 or 372 1234567'],
      required: true,
      unique: true
    },
  },
  { collection: "farmers" }
);

module.exports = mongoose.model("Farmer", FarmerSchema);
