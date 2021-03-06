const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;
const val = require("../models/mongoose_validation");

var AdministeredMedicationSchema = new Schema(
  {
    date_of_administration: {
      type: Date,
      default: Date.now,
    },
    quantity_administered: {
      type: Number,
      trim: true,
      validate: [val.validateIsNumber, "Enter valid quantity."],
      required: true,
      default: 0,
    },
    quantity_type: {
      type: String,
      trim: true,
      validate: [val.validateIsString, "Please enter a valid quantity type."],
      enum: ["ML", "MG", "COUNT", "UNASSIGNED"],
      default: "UNASSIGNED",
    },
    administered_by: {
      type: String,
      trim: true,
      validate: [val.validateIsString, "Please enter a valid name."],
      required: true,
      default: "", // should we use the user's name here?!??
    },
    withdrawal_end_meat:{
      type: Date,
      default: Date.now,
    },
    withdrawal_end_dairy:{
      type: Date,
      default: Date.now,
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
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { collection: "MedAdmins" }
);

module.exports = mongoose.model(
  "AdministeredMedication",
  AdministeredMedicationSchema
);
