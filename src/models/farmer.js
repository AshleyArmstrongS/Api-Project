const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;
const val = require("../models/mongoose_validation");

const FarmerSchema = new Schema(
  {
    first_name: {
      type: String,
      trim: true,
      validate: [
        val.validateIsName,
        "Invalid, use all letters, max length of 30",
      ],
      required: true,
    },
    second_name: {
      type: String,
      trim: true,
      validate: [
        val.validateIsName,
        "Invalid, use all letters, max length of 30",
      ],
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      validate: [val.validateEmail, "Please fill a valid email address"],
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
      validate: [
        val.validateHerdNumber,
        "Please use a valid herd number, format: IE 1234567 or 372 1234567",
      ],
      required: true,
      unique: true,
    },
  },
  { collection: "farmers" }
);

module.exports = mongoose.model("Farmer", FarmerSchema);
