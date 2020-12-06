const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')

const Animal = require("../models/animals")
const Farmer = require("../models/farmer")
const Medication = require("../models/medication")
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
    const AuthPayLoad = {code: 400, success: false, message: "Sign Up failed."}
    return AuthPayLoad
  }
  const userToken = jwt.sign({ newFarmer: newFarmer._id }, APP_SECRET)
  const AuthPayLoad = {code: 201, success: true, message: "Signed Up successfully.", token: userToken, farmer: newFarmer}
  return AuthPayLoad
}
async function login(parent, args) {
  const loggingInFarmer = await Farmer.findOne({email: args.email})
  if (!loggingInFarmer) {
    const AuthPayLoad = {code: 400, success: false, message: "Email doesn't exist."}
    return AuthPayLoad
  }
  const valid = await bcrypt.compare(args.password, loggingInFarmer.password)
  if (!valid) {
    const AuthPayLoad = {code: 400, success: false, message: "Password Incorrect."}
    return AuthPayLoad
  }
  const userToken = jwt.sign({ userId: loggingInFarmer.id }, APP_SECRET)
  const AuthPayLoad = {code: 200, success: true, message: "Logged in successfully.", token: userToken, farmer: loggingInFarmer}
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
      farmer_id:      id,
  })
  const valid = await newAnimal.save()
  if (!valid) {
    const AnimalMutationResponse = {code: 400, success: false, message: "Animal not created"}
    return AnimalMutationResponse
  }
   const AnimalMutationResponse =
        {code: 201, success: true, message: "Animal created successful", animal: newAnimal}
  return AnimalMutationResponse
}
async function updateAnimal(parent, args){
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
    const AnimalMutationResponse = {code: 400, success: false, message: "Animal not updated"}
    return AnimalMutationResponse
  }
  const editedAnimal = Animal.findOne({"_id" : args.id})
  const AnimalMutationResponse =
      {code: 200, success: true, message: "Animal updated successful", animal: editedAnimal}
  return AnimalMutationResponse
}

async function deleteAnimal(parent, args, context){
  const id = await getUserId(context)
  const animalToDelete = await Animal.findOne({"tag_number": args.tag_number, "farmer_id": id })
  const valid =  Animal.findByIdAndDelete(animalId.id)
  if(!valid) {
    const AnimalMutationResponse = {code: 400, success: false, message: "Animal not deleted"}
    return AnimalMutationResponse
  }
  const AnimalMutationResponse =
      {code: 200, success: true, message: "Animal deleted successful", animal: animalToDelete}
  return AnimalMutationResponse
}

// Group Mutations
async function createGroup(parent, args, context) {
  const id = getUserId(context)
  const newGroup = new Group({
    group_name: args.group_name,
    group_description: args.group_description,
    farmer_id: id,
  })
  const valid = await newGroup.save()
  if(!valid) {
    const GroupMutationResponse = {code: 400, success: false, message: "Group not created"}
    return GroupMutationResponse
  }
  const GroupMutationResponse =
  {code: 201, success: true, message: "Group created successful", group: newGroup}
  return GroupMutationResponse
}
 async function updateGroup(parent, args, context){
   const id = await getUserId(context)
   const valid = await Group.findByIdAndUpdate({"_id" : args.id},
     {
       group_name: args.group_name,
       group_description: args.group_description
     })
     if(!valid) {
      const GroupMutationResponse = {code: 400, success: false, message: "Group not updated"}
      return GroupMutationResponse
    }
    const editedGroup = Group.findOne({"_id" : args.id})
    const GroupMutationResponse =
    {code: 200, success: true, message: "Animal updated successful", group: editedGroup}
    return GroupMutationResponse
}
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
const valid = await newMedication.save()
if (!valid) {
  const MedicationMutationResponse =
      {code: 400, success: false, message: "Medication not created"}
  return MedicationMutationResponse
}
const MedicationMutationResponse =
    {code: 201, success: true, message: "Medication created successful", medication: newMedication}
    return MedicationMutationResponse
}
async function updateMedication(parent, args){
    const valid = await Medication.findByIdAndUpdate({"_id" : args.id},
  {
    medication_name: args.medication_name,
    supplied_by: args.supplied_by,
    quantity: args.quantity,
    quantity_type: args.quantity_type,
    withdrawal_days_dairy: args.withdrawal_days_dairy,
    withdrawal_days_meat: args.withdrawal_days_meat,
    remaining_quantity: args.remaining_quantity,
    batch_number: args.batch_number,
    expiry_date: args.expiry_date,
    purchase_date: args.purchase_date,
    comments: args.comments,
  })
  if (!valid) {
    const MedicationMutationResponse =
      {code: 400, success: false, message: "Medication not updated"}
    return MedicationMutationResponse
  }
  const updatedMedication = await Medication.findOne({"_id" : args.id})
  const MedicationMutationResponse =
    {code: 200, success: true, message: "Animal updated successful", medication: updatedMedication}
  return MedicationMutationResponse
}

module.exports = {
    createAnimal,
    signUp,
    login,
    deleteAnimal,
    createGroup,
    updateGroup,
    createMedication,
    updateAnimal,
    updateMedication,
}