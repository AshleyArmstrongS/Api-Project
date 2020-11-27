const mongoose = require('mongoose');
mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;

var MedicalAdministrationSchema = new Schema({ // verify quantity in API as there are three diff quantities
  date_of_use: {
    type: Date,
    default: Date.now
  },
  medication_name: {
    type: String,
    required: true
  },
  quantity_used_ml: {
    type: Number,
    required: true,
    default: 0
  },
  quantity_used_mg: {
    type: Number,
    required: true,
    default: 0
  },
  quantity_used_int: {
    type: Number,
    required: true,
    default: 0
  },
  administered_by: {
    type: String,
    required: true
  },
  reason_for:{
    type: String
  },
  animal_tag_number: {
    type: Number,
    ref: "Animal"
  }
}, {collection: 'MedAdmins'})

module.exports = mongoose.model('MedicalAdministration', MedicalAdministrationSchema);