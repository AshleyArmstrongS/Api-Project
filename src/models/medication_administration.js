const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;

var MedicationAdministrationSchema = new Schema(
  {
    // verify quantity in API as there are three diff quantities
    date_of_administration: {
      type: Date,
      default: Date.now,
    },
    // medication_name: {  might not need as medication is referenced
    //   type: String,
    //   required: true
    // },
    quantity_administered: {
      type: Number,
      required: true,
      default: 0,
    },
    quantity_type: {
      type: String,
      enum: ["ML", "MG", "COUNT", "UNASSIGNED"],
      default: "UNASSIGNED",
    },
    administered_by: {
      type: String,
      required: true,
    },
    reason_for_administration: {
      type: String,
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
  "MedicationAdministration",
  MedicationAdministrationSchema
);
