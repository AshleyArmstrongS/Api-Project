const Animal = require("../models/animals")
const Farmer = require("../models/farmer")
const { APP_SECRET, getUserId } = require('../utils')

function info(){
    return "Hi this is the OptiFarm API."
}
function animal(parent, args){
    var id = args.id
   return Animal.findById(id)
}
function herd(){
    return Animal.find({});
}
function farmer(parent, args, context){
    return Farmer.findById(getUserId(context))
}

module.exports = {
    info,
    animal,
    herd,
    farmer,
}