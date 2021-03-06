const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;
const val = require("../models/mongoose_validation");

var MedicationSchema = new Schema(
  {
    medication_name: {
      type: String,
      trim: true,
      validate: [val.validateIsString, "Enter valid name."],
      required: true,
    },
    supplied_by: {
      type: String,
      trim: true,
      validate: [val.validateIsString, "Enter valid supplier."],
      required: true,
    },
    quantity: {
      type: Number,
      trim: true,
      validate: [val.validateIsNumber, "Enter valid quantity."],
      required: true,
      default: 0,
    },
    medicine_type: {
      type: String,
      trim: true,
      validate: [val.validateIsString, "Enter valid medicine type"],
      enum: ["ANTIBIOTIC","VACCINATION","DOSE", "UNASSIGNED"],
      default: "UNASSIGNED",
      required: true,
    },
    withdrawal_days_meat: {
      type: Number,
      trim: true,
      validate: [val.validateIsNumber, "Enter valid number."],
      required: true,
    },
    withdrawal_days_dairy: {
      type: Number,
      trim: true,
      validate: [val.validateIsNumber, "Enter valid number."],
      required: true,
    },
    quantity_type: {
      type: String,
      trim: true,
      validate: [val.validateIsString, "Enter valid quantity type"],
      enum: ["ML", "MG", "COUNT", "UNASSIGNED"],
      default: "UNASSIGNED",
      required: true,
    },
    remaining_quantity: {
      type: Number,
      trim: true,
      validate: [val.validateIsNumber, "Enter valid quantity."],
      required: true,
    },
    batch_number: {
      type: String,
      trim: true,
      validate: [val.validateIsString, "Enter valid batch."],
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
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { collection: "medication" }
);

module.exports = mongoose.model("Medication", MedicationSchema);
