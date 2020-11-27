const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')
const {farmerHerdNo} = require('./Query')
const Animal = require("../models/animals")
const Farmer = require("../models/farmer")

    async function signUp(parent, args, context, info) {
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
        var userToken = jwt.sign({ newFarmer: newFarmer._id }, APP_SECRET)
        var AuthPayLoad = {token: userToken, farmer: newFarmer}
        return AuthPayLoad
      }
      async function login(parent, args, context, info) {
        const loggingInFarmer = await Farmer.findOne({email: args.email})
        if (!loggingInFarmer) {
          throw new Error('No such user found')
        }
        const valid = await bcrypt.compare(args.password, loggingInFarmer.password)
        if (!valid) {
          throw new Error('Invalid password')
        }
        const userToken = jwt.sign({ userId: loggingInFarmer.id }, APP_SECRET)
        var AuthPayLoad = {token: userToken, farmer: loggingInFarmer}
        return AuthPayLoad
      }

      function farmerHerdNoMut(parent, args, context){
        const id = getUserId(context)
        const herd_number = Farmer.findById(id).select({'herd_number': 1, "_id": 0})
        return herd_number
    }
      async function createAnimal(parent, args, context){
        const herd_number = await farmerHerdNoMut(parent, args, context)
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
        })
        const error = await newAnimal.save()
        if(error) return error
        return newAnimal
    }
    async function deleteAnimal(parent, args, context){
      const herd_number = await farmerHerdNoMut(parent, args, context)
      const animalId = await Animal.findOne({"tag_number": args.tag_number, "herd_number": herd_number.herd_number})
      return await Animal.findByIdAndDelete(animalId.id)
    }

module.exports = {
    createAnimal,
    signUp,
    login,
    deleteAnimal,
}