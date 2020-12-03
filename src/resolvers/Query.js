const Animal = require("../models/animals")
const Farmer = require("../models/farmer")
const Group = require("../models/group")
const Medication = require("../models/medication")
const {getUserId } = require('../utils')
//API info
function info(){
    return "This is the OptiFarm API"
}
//User
function getFarmer(parent, args, context){
    const id = getUserId(context)
    return Farmer.findById(id)
}
//Animal
function getAnimal(parent, args){
   return Animal.findById(args.id)
}
function getAnimalByTag(parent, args, context){
    const id = getUserId(context)
    return Animal.findOne({"tag_number": args.tag_number, "farmer_id": id})
}
//Animals
function getHerd(parent, args, context){
    const id = getUserId(context)
    return Animal.find({"farmer_id": id })
}
function getAnimalByBreed(parent, args, context) {
    const id = getUserId(context)
    return Animal.find({"breed_type": args.breed_type, "farmer_id": id })
}
function getAnimalByPureBreed(parent, args, context) {
    const id = getUserId(context)
    return Animal.find({"pure_breed": args.pure_breed, "farmer_id": id })
}
function getAnimalBySex(parent, args, context) {
    const id = getUserId(context)
    return Animal.find({"male_female": args.male_female, "farmer_id": id })
}
function getProgeny(parent, args, context){
    const id = getUserId(context)
    if(args.male_female == "M"){
        return Animal.find({ "sire_number" : args.tag_number, "farmer_id" : id })
    }
    return Animal.find({ "mother_number" : args.tag_number, "farmer_id" : id })
}

// Search Queries

function getAnimalsByDateOfBirth(parent, args, context) {
  const id = getUserId(context)
  return Animal.find({"date_of_birth": new Date(args.date_of_birth), "farmer_id": id })
}

function getAnimalsByDateBornAfter(parent, args, context) {
  const id = getUserId(context)
  return Animal.find({"date_of_birth": {$gte : new Date(args.date_of_birth)} , "farmer_id": id })
}

function getAnimalsByDateBornBefore(parent, args, context) {
  const id = getUserId(context)
  return Animal.find({"date_of_birth": {$lte : new Date(args.date_of_birth)} , "farmer_id": id })
}

function getAnimalsByDatesBornBetween(parent, args, context) {
  const id = getUserId(context)
  return Animal.find({"date_of_birth": {$gte : new Date(args.after), $lte : new Date(args.before)} , "farmer_id": id })
}

//Group
function getGroup(parent, args){
  return Group.findById(args.id)
}
// might need to put group_name as unique
function getGroupByName(parent, args, context){
  const id = getUserId(context)
  return Group.find({"group_name": args.group_name, "farmer_id": id})
}
function getGroupByDescription(parent, args, context){
  const id = getUserId(context)
  return Group.find({"group_description": args.group_description, "farmer_id": id})
}

//Medication
function getMedication(parent, args, context) {
    return Medication.findById(args.id)
}
//Medications
function getMedications(parent, args, context) {
    const id = getUserId(context)
    return Medication.find({"farmer_id" : id})
}
module.exports = {
    info,
    getFarmer,

    // Animal
    getAnimal,
    getAnimalByTag,
    getHerd,
    getAnimalByBreed,
    getAnimalByPureBreed,
    getAnimalBySex,
    getProgeny,
    getAnimalsByDateOfBirth,
    getAnimalsByDateBornAfter,
    getAnimalsByDateBornBefore,
    getAnimalsByDatesBornBetween,

    // Group
    getGroup,
    getGroupByName,
    getGroupByDescription,

    // Medication
    getMedication,
    getMedications,
}
