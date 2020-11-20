//Require Mongoose
var mongoose = require('mongoose');

// Define schema
var Schema = mongoose.Schema;


var FarmerSchema = new Schema({ // need to figure out the auto increment and referencing
  // farmer_id: {type: number required: true}
  first_name: {
    type: String,
    required: true,
    validate: /\S+/
  },
  second_name: {
    type: String,
    required: true,
    validate: /\S+/
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: 'Email address is required' //put in validation here
  },
  password: {
    type: String,
    required: true
  },
  farm_type: {
    enum : ['Beef', 'Dairy'],
    default: ''
  },
  farm_address: {
    type: String,
    required: true
  },
  vet: {
    type: String
  },
  herd_number : {
    type: String,
    required: true,
    unique: true
  } // might need validation here
})

/*
  validation of email:
    var validateEmail = function(email) {
      var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return re.test(email)
    };

  Put this in email above: 
    validate: [validateEmail, 'Please fill a valid email address'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
*/

// const Vet = { // might not use this in schema
//   vet_name: {
//     type: String,
//     required: true
//   }
// }

// const VeterinaryClinic = { possibly can add this in

// }

var AnimalSchema = new Schema({
  tag_number: { // need some clarification on this
    type: Number,
    required: true
    // unique: true,
    // integer: true
  },
  herd_number : {
    type: String,
    required: true,
    unique: true
  }, // might need validation here
  sire_number: {
    type: Number,
    required: true
  }, 
  mother_number: {
    type: Number,
    required: true
  }, 
  male_female: {
    enum: ['M', 'F']
  }, 
  breed_type: {
    type: String,
    required: true
  }, 
  date_of_birth: {
    type: Date,
    required: true
  }, 
  pure_breed: {
    type: Boolean,
    default: false
  }, 
  animal_name: {
    type: String,
    default: ''
  }, 
  descrition: {
    type: String,
    default: ''
  }, 
  farmer_id: {
    type: Number,
    required: true
  } 
})

var BatchSchema = new Schema({
  // batch_id: {

  // },
  batch_name: {
    type: String,
    required: true
  },
  batch_description: {
    type: String,
    default: ''
  }, 
  // date_created: {
  //   type: Date,
  //   default: Date.now
  // }, 
  // date_last_edited: {
  //   type: Date,
  //   timestamps: true
  // } 
}, {timestamps: true})

var RemedyUsageSchema = new Schema({ // verify quantity in API as there are three diff quantities
  // remedy_id: {

  // },
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
  }
})

var MedicationSchema = new Schema({// verify quantity in API as there are three diff quantities
  // medication_id: {

  // },
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
  }
})
