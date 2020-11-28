const mongoose = require('mongoose');
mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;

var MedicationSchema = new Schema({// verify quantity in API as there are three diff quantities
  medication_name: {
    type: String,
    required: true
  },
  supplied_by: {
    type: String,
    required: true
  },
  quantity_ml: {
    type: Number,
    required: true,
    default: 0
  },
  quantity_int: {
    type: Number,
    required: true,
    default: 0
  }, 
  quantity_mg: {
    type: Number,
    required: true,
    default: 0
  }, 
  withdrawal_days_meat: {
    type: Number,
    required: true
  }, 
  withdrawal_days_dairy: {
    type: Number,
    required: true
  },
  remaining_quantity_ml: {
    type: Number,
    required: true
  }, 
  remaining_quantity_int: {
    type: Number,
    required: true
  }, 
  remaining_quantity_mg: {
    type: Number,
    required: true
  }, 
  batch_number: {
    type: Number,
    required: true
  },
  expiry_date: {
    type: Date,
    required: true
  },
  comments: {
    type: String,
    default: ''
  },
  medication_used: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MedicalAdministration"
  }
}, {collection: 'medication'})

module.exports = mongoose.model('Medication', MedicationSchema);