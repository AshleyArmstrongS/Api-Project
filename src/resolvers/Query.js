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
async function animalTag(parent, args, context){
    const id = await getUserId(context)
    return await Animal.findOne({"tag_number": args.tag_number, "farmer_id": id})
}
//Animals
async function herd(parent, args, context){
    const id = getUserId(context)
    return await Animal.find({"farmer_id": id })
}
async function animalBreed(parent, args, context) {
    const id = getUserId(context)
    return await Animal.find({"breed_type": args.breed_type, "farmer_id": id })
}
async function animalPureBreed(parent, args, context) {
    const id = getUserId(context)
    return await Animal.find({"pure_breed": args.pure_breed, "farmer_id": id })
}
async function animalSex(parent, args, context) {
    const id = getUserId(context)
    return await Animal.find({"male_female": args.male_female, "farmer_id": id })
}
//Medication
function medication(parent, args, context) {
    return Medication.findById(args.id)
}
//Medications
async function medications(parent, args, context) {
    const id = await getUserId(context)
    return Medication.find({"farmer_id" : id})
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
    animalSex,
    animalBreed,
    animalPureBreed,
    //Medication
    medication,
    //Medications
    medications,
}