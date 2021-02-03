const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;

const validateIsNumber = number => {
  // regex from https://stackoverflow.com/questions/4246077/matching-numbers-with-regular-expressions-only-digits-and-commas/4247184#4247184
  const re = /^-?\d{1,3}(,\d{3})*(\.\d\d)?$|^\.\d\d$/
  re.test(number)
  return re
}
const validateIsString = str => {
  const re = /^$|^\[a-zA-Z ]+$/
  re.test(str)
  return re
}

var AdministeredMedicationSchema = new Schema(
  {
    date_of_administration: {
      type: Date,
      default: Date.now,
    },
    quantity_administered: {
      type: Number,
      trim: true,
      validate: [validateIsNumber, 'Enter valid quantity.'],
      required: true,
      default: 0,
    },
    quantity_type: {
      type: String,
      trim: true,
      validate: [validateIsString, 'Please enter a valid quantity type.'],
      enum: ["ML", "MG", "COUNT", "UNASSIGNED"],
      default: "UNASSIGNED",
    },
    administered_by: {
      type: String,
      trim: true,
      validate: [validateIsString, 'Please enter a valid name.'],
      required: true,
      default: "", // should we use the farmer's name here?!??
    },
    reason_for_administration: {
      type: String,
      default: "",
    },
    animal_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Animal",
    },
    medication_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medication",
    },
    farmer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer",
    },
  },
  { collection: "MedAdmins" }
);

module.exports = mongoose.model(
  "AdministeredMedication",
  AdministeredMedicationSchema
);
