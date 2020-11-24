const { GraphQLServer } = require('graphql-yoga')
require('./atlas_client');
const Query = require('./resolvers/Query');
const Mutation = require('./resolvers/Mutation');

//Require Mongoose
var mongoose = require('mongoose');

// Define schema
var Schema = mongoose.Schema;

var FarmerSchema = new Schema({ // need to figure out the auto increment and referencing
  // _id: {
  //   type: Number,
  //   value: getNextSequenceValue("farmer_id"),
  // },
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
    type: String
    //trim: true,
    //lowercase: true,
    //unique: true,
    //required: 'Email address is required' //put in validation here
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
    //unique: true
  } // might need validation here
})

var AnimalSchema = new Schema({
  tag_number: { // need some clarification on this
    type: Number,
    required: true
    // unique: true,
    // integer: true
  },
  herd_number : {
    type: String,
    required: true
    //unique: true
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer'
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
  animal_tag_number: {
    type: Number,
    ref: "Animal"
  }
}, {timestamps: true})

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
    type: mongoose.Schema.Types.ObjectId,
    ref: "Animal"
  }
})

const MedAdmin = mongoose.model('MedAdmin', MedicalAdministrationSchema);
const Farmer = mongoose.model('Farmer', FarmerSchema);
const Animal = mongoose.model('Animal', AnimalSchema);
const Group = mongoose.model('Group', BatchSchema);

const aml = Animal.findById({_id: "5fb7f93672e9014d94087d63"})

//console.log(tag_number)

var medAdmin = new MedAdmin({medication_name: 'Arnica', quantity_used_int: 1, administered_by: 'Conor', reason_for: 'sore foot', animal_tag_number: aml.tag_number})
medAdmin.save()

medAdmin.save(function(error) {
  if (!error) {
    MedAdmin.find({})
          .populate('animal_tag_number')
          .exec(function(error, medAdmin) {
              console.log(JSON.stringify(medAdmin, null, "\t"))
          })
  }
});

// user.save(function(err, user){
//   if(err) return console.error(err);
//   log.d("user saved", user);
// });




//var farmer = new Farmer({ first_name: 'Con', second_name: 'Clarke', email: 'con@con.con', password: '1234', farm_type: 'Beef', farm_address: 'asdf', herd_number: 'IE 123456' });

//const farmer = Farmer.find({name: 'Con'});

// var animal = new Animal({ tag_number: 129945, herd_number: 'IE 12345', sire_number: 12323, mother_number: 12343, male_female: 'M', breed_type: 'LMN', date_of_birth: '1997-08-27',
//   pure_breed: 'true', animal_name: 'Con', descrition: 'asdf', farmer_id: farmer._id });

// var animal1 =  Animal.find({tag_number: 12345});
// var animal2 =  Animal.find({tag_number: 129945});

// var group = new Group({batch_name: 'Conor Test', batch_description: 'testing', animal_tag_number: animal1._id})
// var group1 = new Group({batch_name: 'Conor Test', batch_description: 'testing', animal_tag_number: animal2._id})
// group.save()
// group1.save()
//farmer.save();
// animal.save();

// animal.save(function(error) {
//   if (!error) {
//       Animal.find({})
//           .populate('farmer_id')
//           .exec(function(error, animal) {
//               console.log(JSON.stringify(animal, null, "\t"))
//           })
//   }
// });

// group.save(function(error) {
//   if (!error) {
//       Group.find({})
//           .populate('animal_tag_number')
//           .exec(function(error, group) {
//               console.log(JSON.stringify(group, null, "\t"))
//           })
//   }
// });

// group1.save(function(error) {
//   if (!error) {
//       Group.find({})
//           .populate('animal_tag_number')
//           .exec(function(error, group1) {
//               console.log(JSON.stringify(group1, null, "\t"))
//           })
//   }
// });

// var grp = Group.findOne({batch_name: 'Conor Test'});

// grp.batch_description = 'test2';

// grp.save()

const resolvers = {
    Query
    //Mutation
}

const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers
  })
server.start(() => console.log(`Server is running on http://localhost:4000`))
