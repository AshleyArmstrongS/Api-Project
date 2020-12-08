const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;

var MedicationSchema = new Schema(
  {
    // verify quantity in API as there are three diff quantities
    medication_name: {
      type: String,
      required: true,
    },
    supplied_by: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    withdrawal_days_meat: {
      type: Number,
      required: true,
    },
    withdrawal_days_dairy: {
      type: Number,
      required: true,
    },
    quantity_type: {
      type: String,
      enum: ["ML", "MG", "COUNT", "UNASSIGNED"],
      default: "UNASSIGNED",
    },
    remaining_quantity: {
      type: Number,
      required: true,
    },
    batch_number: {
      type: String,
      required: true,
    },
    expiry_date: {
      type: Date,
      required: true,
    },
    purchase_date: {
      type: Date,
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
