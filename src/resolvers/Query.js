const Animal = require("../models/animals")
const Farmer = require("../models/farmer")
const Medication = require("../models/medication")
const {getUserId } = require('../utils')
//API info
function info(){
    return "Hi this is the OptiFarm API."
}
//User
function farmer(parent, args, context){
    const id = getUserId(context)
    return Farmer.findById(id)
}
//Animal
function animal(parent, args){
   return Animal.findById(args.id)
}
function animalTag(parent, args, context){
    const id = getUserId(context)
    return Animal.findOne({"tag_number": args.tag_number, "farmer_id": id})
}
//Animals
function herd(parent, args, context){
    const id = getUserId(context)
    return Animal.find({"farmer_id": id })
}
function animalBreed(parent, args, context) {
    const id = getUserId(context)
    return Animal.find({"breed_type": args.breed_type, "farmer_id": id })
}
function animalPureBreed(parent, args, context) {
    const id = getUserId(context)
    return Animal.find({"pure_breed": args.pure_breed, "farmer_id": id })
}
function animalSex(parent, args, context) {
    const id = getUserId(context)
    return Animal.find({"male_female": args.male_female, "farmer_id": id })
}
function progeny(parent, args, context){
    const id = getUserId(context)
    if(args.male_female == "M"){
        return Animal.find({ "sire_number" : args.tag_number, "farmer_id" : id })
    }
    return Animal.find({ "mother_number" : args.tag_number, "farmer_id" : id })
}
//Medication
function medication(parent, args, context) {
    return Medication.findById(args.id)
}
//Medications
function medications(parent, args, context) {
    const id = getUserId(context)
    return Medication.find({"farmer_id" : id})
}
module.exports = {
    info,
    farmer,
    animal,
    animalTag,
    herd,
    animalSex,
    animalBreed,
    animalPureBreed,
    progeny,
    medication,
    medications,
}
