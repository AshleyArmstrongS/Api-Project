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

const Farmer = mongoose.model('Farmer', FarmerSchema);
const Animal = mongoose.model('Animal', AnimalSchema);

//var farmer = new Farmer({ first_name: 'Con', second_name: 'Clarke', email: 'con@con.con', password: '1234', farm_type: 'Beef', farm_address: 'asdf', herd_number: 'IE 123456' });

const farmer = Farmer.find({name: 'Con'});

var animal = new Animal({ tag_number: 129945, herd_number: 'IE 12345', sire_number: 12323, mother_number: 12343, male_female: 'M', breed_type: 'LMN', date_of_birth: '1997-08-27',
  animal_name: 'Con', descrition: 'asdf', farmer_id: farmer._id });

//farmer.save();
animal.save();

animal.save(function(error) {
  if (!error) {
      Animal.find({})
          .populate('farmer_id')
          .exec(function(error, animal) {
              console.log(JSON.stringify(animal, null, "\t"))
          })
  }
});

const resolvers = {
    Query
    //Mutation
}

const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers
  })
server.start(() => console.log(`Server is running on http://localhost:4000`))
