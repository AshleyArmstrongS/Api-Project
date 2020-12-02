const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')

const Animal = require("../models/animals")
const Farmer = require("../models/farmer")
const Medication = require("../models/medication")
const Breed = require("../models/breed")
const Group = require("../models/group")

//Internal functions
function farmerHerdNo(id){
  return Farmer.findById(id).select({'herd_number': 1, "_id": 0})
}
//Login/SignUp
async function signUp(parent, args) {
  const password = await bcrypt.hash(args.password, 10)
  const newFarmer = await new Farmer({
    first_name: args.first_name,
    second_name: args.second_name,
    farm_type: args.farm_type,
    farm_address: args.farm_address,
    password: password,
    email: args.email,
    herd_number: args.herd_number
  })
  const valid = await newFarmer.save()
  if (!valid) {
    throw new Error('Could not save user')
  }
  const userToken = jwt.sign({ newFarmer: newFarmer._id }, APP_SECRET)
  const AuthPayLoad = {token: userToken, farmer: newFarmer}
  return AuthPayLoad
}
async function login(parent, args) {
  const loggingInFarmer = await Farmer.findOne({email: args.email})
  if (!loggingInFarmer) {
    throw new Error('No such user found')
  }
  const valid = await bcrypt.compare(args.password, loggingInFarmer.password)
  if (!valid) {
    throw new Error('Invalid password')
  }
  const userToken = jwt.sign({ userId: loggingInFarmer.id }, APP_SECRET)
  const AuthPayLoad = {token: userToken, farmer: loggingInFarmer}
  return AuthPayLoad
}

//Animal Mutations
async function createAnimal(parent, args, context){
  const id = getUserId(context)
  const herd_number = await farmerHerdNo(id)
  const newAnimal = new Animal({
      tag_number:     args.tag_number,
      herd_number:    herd_number.herd_number,
      sire_number:    args.sire_number,
      mother_number:  args.mother_number,
      male_female:    args.male_female,
      breed_type:     args.breed_type,
      date_of_birth:  args.date_of_birth,
      pure_breed:     args.pure_breed,
      animal_name:    args.animal_name,
      description:    args.description,
      farmer_id:      id
  })
  const error = await newAnimal.save()
  if(error) return error
  return newAnimal
}

async function editAnimal(parent, args, context){
  const valid = await Animal.findByIdAndUpdate({"_id" : args.id},
    {
      sire_number:    args.sire_number,
      mother_number:  args.mother_number,
      male_female:    args.male_female,
      breed_type:     args.breed_type,
      date_of_birth:  args.date_of_birth,
      pure_breed:     args.pure_breed,
      animal_name:    args.animal_name,
      description:    args.description,
    })
    if (!valid) {
      throw new Error('Could not edit animal')
    }
    return Animal.findOne({"_id" : args.id})
}

async function deleteAnimal(parent, args, context){
  const id = await getUserId(context)
  const animalId = await Animal.findOne({"tag_number": args.tag_number, "farmer_id": id })
  return await Animal.findByIdAndDelete(animalId.id)
}

// Group Mutations
async function createGroup(parent, args, context) {
  const id = getUserId(context)
  const newGroup = new Group({
    group_name: args.group_name,
    group_description: args.group_description,
    farmer_id: id
  })
  const error = await newGroup.save()
  if(error) return error
  return newGroup
}
// untested editGroup function
// async function editGroup(parent, args, context){
//   const id = await getUserId(context)
//   const editedGroup = await Group.findByIdAndUpdate({"_id" : args.id},
//     {
//       group_name: args.group_name,
//       group_description: args.group_description
//     })
//     const error = await editedGroup.save()
//     if(error) return error
//     return editedGroup
// }

//Medication Queries
async function createMedication(parent, args, context){
  const id = getUserId(context)
const newMedication = new Medication({
  medication_name:        args.medication_name,
  supplied_by:            args.supplied_by,
  quantity:               args.quantity,
  quantity_type:          args.quantity_type,
  remaining_quantity:     args.quantity,
  withdrawal_days_meat:   args.withdrawal_days_meat,
  withdrawal_days_dairy:  args. withdrawal_days_dairy,
  batch_number:           args.batch_number,
  expiry_date:            args.expiry_date,
  purchase_date:          args.purchase_date,
  comments:               args.comments,
  farmer_id:              id,
})
const error = await newMedication.save()
if(error) return error
return newMedication
}

module.exports = {
    createAnimal,
    signUp,
    login,
    deleteAnimal,
    createGroup,
    createMedication,
    editAnimal,
}