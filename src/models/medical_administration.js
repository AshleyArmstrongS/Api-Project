const mongoose = require('mongoose');
mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;

var MedicalAdministrationSchema = new Schema({ // verify quantity in API as there are three diff quantities
  date_of_use: {
    type: Date,
    default: Date.now
  },
  // medication_name: {  might not need as medication is referenced
  //   type: String,
  //   required: true
  // },
  quantity_used: {
    type: Number,
    required: true,
    default: 0
  },
  quantity_type: {
    type: String,
    enum : ["Ml", "Mg", "Count", "Unassigned"],
    default : "Unassigned"
  },
  administered_by: {
    type: String,
    required: true
  },
  reason_for:{
    type: String
  },
  animal_tag_number: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Animal"
  },
  medication_used: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medication"
  },
  farmer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farmer"
  }
}, {collection: 'MedAdmins'})

module.exports = mongoose.model('MedicalAdministration', MedicalAdministrationSchema);