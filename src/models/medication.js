const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;

const validateIsNumber = number => {
  // regex from https://stackoverflow.com/questions/4246077/matching-numbers-with-regular-expressions-only-digits-and-commas/4247184#4247184
  const re = /^-?\d{1,3}(,\d{3})*(\.\d\d)?$|^\.\d\d$/
  return re.test(number)
}
const validateIsString = str => {
  const re = /^$|^\[a-zA-Z ]+$/
  return re.test(str)
}

var MedicationSchema = new Schema(
  {
    // verify quantity in API as there are three diff quantities
    medication_name: {
      type: String,
      trim: true,
      validate: [validateIsString, 'Enter valid quantity.'],
      required: true,
    },
    supplied_by: {
      type: String,
      trim: true,
      validate: [validateIsString, 'Enter valid quantity.'],
      required: true,
    },
    quantity: {
      type: Number,
      trim: true,
      validate: [validateIsNumber, 'Enter valid quantity.'],
      required: true, // question if default is 0 does it go to false?!??
      default: 0,
    },
    withdrawal_days_meat: {
      type: Number,
      trim: true,
      validate: [validateIsNumber, 'Enter valid number.'],
      required: true,
    },
    withdrawal_days_dairy: {
      type: Number,
      trim: true,
      validate: [validateIsNumber, 'Enter valid number.'],
      required: true,
    },
    quantity_type: {
      type: String,
      trim: true,
      validate: [validateIsString, 'Enter valid quantity.'],
      enum: ["ML", "MG", "COUNT", "UNASSIGNED"],
      default: "UNASSIGNED",
      required: true,
    },
    remaining_quantity: {
      type: Number,
      trim: true,
      validate: [validateIsNumber, 'Enter valid quantity.'],
      required: true,
    },
    batch_number: {
      type: String,
      trim: true,
      validate: [validateIsString, 'Enter valid quantity.'],
      required: true,
    },
    expiry_date: {
      type: Date,
      trim: true,
      required: true,
    },
    purchase_date: {
      type: Date,
      trim: true,
      required: true,
    },
    comments: {
      type: String,
      default: "",
    },
    farmer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer",
    },
  },
  { collection: "medication" }
);

module.exports = mongoose.model("Medication", MedicationSchema);
