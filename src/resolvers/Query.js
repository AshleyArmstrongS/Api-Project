const mongoose = require('mongoose');
const Schemas = require('../mongoose_schema');
const animals = mongoose.model('AnimalSchema', Schemas);


function info(){
    return "Hi this is the OptiFarm API."
}
function animal(){
   return animals.find({})
}
module.exports = {
    info,
    animal,
}

