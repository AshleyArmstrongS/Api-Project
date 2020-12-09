
const Animal = require("../models/animals")
const breed = require("../models/breed")
const Farmer = require("../models/farmer")
const Group = require("../models/group")
const Medication = require("../models/medication")
const Breed = require("../models/breed")
const {getUserId } = require('../utils')
//API info
function info() {
  return "This is the OptiFarm API";
}
//User
function farmer(parent, args, context) {
  const id = getUserId(context);
  return Farmer.findById(id);
}
//Animal
function animal(parent, args, context) {
  const id = getUserId(context);
  return Animal.findOne({ _id: args.id, farmer_id: id });
}
function animalByTag(parent, args, context) {
  const id = getUserId(context);
  return Animal.findOne({ tag_number: args.tag_number, farmer_id: id });
}
//Animals
function herd(parent, args, context) {
  const id = getUserId(context);
  return Animal.find({ farmer_id: id });
}
function animalByBreed(parent, args, context) {
  const id = getUserId(context);
  return Animal.find({ breed_type: args.breed_type, farmer_id: id });
}
function animalByPureBreed(parent, args, context) {
  const id = getUserId(context);
  return Animal.find({ pure_breed: args.pure_breed, farmer_id: id });
}
function animalBySex(parent, args, context) {
  const id = getUserId(context);
  return Animal.find({ male_female: args.male_female, farmer_id: id });
}
function progeny(parent, args, context) {
  const id = getUserId(context);
  if (args.male_female == "M") {
    return Animal.find({ sire_number: args.tag_number, farmer_id: id });
  }
  return Animal.find({ mother_number: args.tag_number, farmer_id: id });
}
// Animal
function animalsBornOn(parent, args, context) {
  const id = getUserId(context);
  return Animal.find({
    date_of_birth: new Date(args.date_of_birth),
    farmer_id: id,
  });
}
function animalsBornAfter(parent, args, context) {
  const id = getUserId(context);
  return Animal.find({
    date_of_birth: { $gte: new Date(args.date_of_birth) },
    farmer_id: id,
  });
}
function animalsBornBefore(parent, args, context) {
  const id = getUserId(context);
  return Animal.find({
    date_of_birth: { $lte: new Date(args.date_of_birth) },
    farmer_id: id,
  });
}
function animalsBornBetween(parent, args, context) {
  const id = getUserId(context);
  return Animal.find({
    date_of_birth: { $gte: new Date(args.after), $lte: new Date(args.before) },
    farmer_id: id,
  });
}
function animalsByCrossBreed(parent, args, context) {
  const id = getUserId(context)
  return Animal.find({"cross_breed": args.cross_breed, farmer_id: id})
}
//Group
function group(parent, args) {
  return Group.findById(args.id);
}
function groupByName(parent, args, context) {
  const id = getUserId(context);
  return Group.find({ group_name: args.group_name, farmer_id: id });
}
function groupByDescription(parent, args, context) {
  const id = getUserId(context);
  return Group.find({
    group_description: args.group_description,
    farmer_id: id,
  });
}
//Medication
function medication(parent, args, context) {
  return Medication.findById(args.id);
}
//Medications
function medications(parent, args, context) {
  const id = getUserId(context);
  return Medication.find({ farmer_id: id });
}

function medicationsByName(parent, args, context) {
  const id = getUserId(context)
  return Medication.find({"medication_name": args.medication_name, "farmer_id" : id})
}
function medicationsExpired(parent, args, context) {
  const id = getUserId(context)
  return Medication.find({"expiry_date": {$lt : Date.now}, "farmer_id" : id})
}

function medicationsReasonsFor(parent, args, context) {
  const id = getUserId(context)
  return Medication.find({"reason_for": {$regex : args.reason_for}, "farmer_id" : id})
}
// Breeds
function breedName(parent, args, context) {
  return Breed.find({"breed_name": args.breed_name})
}
function breedCode(parent, args, context) {
  return Breed.find({"breed_code": args.breed_code})
}

module.exports = {
    info,
    farmer,
    // Animal
    animal,
    animalByTag,
    herd,
    animalByBreed,
    animalByPureBreed,
    animalBySex,
    progeny,
    animalsBornOn,
    animalsBornAfter,
    animalsBornBefore,
    animalsBornBetween,
    animalsByCrossBreed,
  // Group
  group,
  groupByName,
  groupByDescription,
    // Medication
    medication,
    medications,
    medicationsByName,
    medicationsExpired,
    medicationsReasonsFor,
    // Breed
    breedName,
    breedCode,
}
