const Animal = require("../models/animals")
const Farmer = require("../models/farmer")
const {getUserId } = require('../utils')

function info(){
    return "Hi this is the OptiFarm API."
}
function farmer(parent, args, context){
    const id = getUserId(context)
    return Farmer.findById(id)
}
function animal(parent, args){
   return Animal.findById(args.id)
}
function animalTag(parent, args){
    return Animal.findOne({"tag_number": args.tag_number})
}
async function herd(parent, args, context){
    const user = await farmer(parent, args, context)
    var animals = await Animal.find({"herd_number": user.herd_number})
    return  animals
}
module.exports = {
    //API info
    info,
    //User
    farmer,
    //Animal
    animal,
    animalTag,
    //Animals
    herd,
}