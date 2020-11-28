const Animal = require("../models/animals")
const Farmer = require("../models/farmer")
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
function farmerHerdNo(parent, args, context){
    const id = getUserId(context)
    const herd_number = Farmer.findById(id).select({'herd_number': 1, "_id": 0})
    return herd_number
}
//Animal
function animal(parent, args){
   return Animal.findById(args.id)
}
async function animalTag(parent, args, context){
    const herd_number = await farmerHerdNo(parent, args, context)
    return await Animal.findOne({"tag_number": args.tag_number, "herd_number": herd_number.herd_number})
}
//Animals
async function herd(parent, args, context){
    const herd_number = await farmerHerdNo(parent, args, context)
    return await Animal.find({"herd_number": herd_number.herd_number})
}
async function animalBreed(parent, args, context) {
    const herd_number = await farmerHerdNo(parent, args, context)
    return await Animal.find({"breed_type": args.breed_type, "herd_number": herd_number.herd_number})
}
async function animalPureBreed(parent, args, context) {
    const herd_number = await farmerHerdNo(parent, args, context)
    return await Animal.find({"pure_breed": args.pure_breed, "herd_number": herd_number.herd_number})
}
async function animalSex(parent, args, context) {
    const herd_number = await farmerHerdNo(parent, args, context)
    return await Animal.find({"male_female": args.male_female, "herd_number": herd_number.herd_number })
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
    //internalUse
}