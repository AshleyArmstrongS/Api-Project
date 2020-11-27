//Require Mongoose
var mongoose = require('mongoose');

// Define schema
var Schema = mongoose.Schema;

// Email validation
var validateEmail = function(email) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email)
}; // Returns a Boolean value that indicates whether or not a pattern exists

var FarmerSchema = new Schema({ // might be worth to check out autoincrementing for _id
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
    required: 'Email address is required', //put in validation here
    validate: [validateEmail, 'Please fill a valid email address'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: true
  },
  farm_type: {
    type: String,
    enum : ["Beef", "Dairy", "Suckler", "Other"],
    default: "Other"
  },
  farm_address: {
    type: String,
    required: true
  },
  medication_administrators: { // normally the farmer but can be the vet
    type: [String]
  },
  herd_number : {
    type: String,
    required: true,
    unique: true
  } // might need validation here
}, {collection: 'farmers'})

// const VetSchema = { // might not use this in schema
//   administered_by: {
//     type: String,
//     required: true
//   },
//   veterinary_clinic: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "VeterinaryClinic"
//   }
//  }

// const VeterinaryClinic = { //possibly can add this in if using Vet
//   name: {
//     type: String,
//     required: true
//   }, 
//   address: {
//     type: String
//   }
// }

var AnimalSchema = new Schema({
  tag_number: { 
    type: Number,
    required: true,
    integer: true
  },
  herd_number : {
    type: String,
    required: true
  },
  sire_number: {
    type: Number,
    required: true
  }, 
  mother_number: {
    type: Number,
    required: true
  }, 
  male_female: {
    type: String,
    enum: ["M", "F"]
  }, 
  breed_type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Breed"
  }, 
  date_of_birth: {
    type: Date,
    required: true
  }, 
  pure_breed: {
    type: Boolean,
    default: false
  },
  cross_breed: {
    type: Boolean
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
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farmer",
    required: true
  } 
}, {collection: 'animals'})

const BreedSchema = new Schema({
  breed_name: {
    type: String,
    required: true
  },
  breed_code: {
    type: String,
    required: true
  }
})

var GroupSchema = new Schema({
  // group_id: {

  // },
  group_name: {
    type: String,
    required: true
  },
  group_description: {
    type: String,
    default: ''
  }, 
  animal_tag_number: {
    type: Number,
    ref: "Animal"
  }
}, {timestamps: true}, {collection: 'groups'})
// leave this out as timestamps does same thing
  // date_created: {
  //   type: Date,
  //   default: Date.now
  // }, 
  // date_last_edited: {
  //   type: Date,
  //   timestamps: true
  // }


var MedicalAdministrationSchema = new Schema({ // verify quantity in API as there are three diff quantities
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
  },
  animal_tag_number: {
    type: Number,
    ref: "Animal"
  }
}, {collection: 'MedAdmins'})

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
  },
  medication_used: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MedicalAdministration"
  }
}, {collection: 'medication'})