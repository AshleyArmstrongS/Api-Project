
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')
const Animal = require("../models/animals")
const Farmer = require("../models/farmer")

    async function signup(parent, args, context, info) {
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
      async function createAnimal(parent, args){
        console.log(args)
        const newAnimal = new Animal({
            tag_number: args.tag_number,
            herd_number: args.herd_number,
            sire_number: args.sire_number,
            mother_number: args.mother_number,
            male_female: args.male_female,
            breed_type: args.breed_type,
            //date_of_birth: args.date_of_birth,
            pure_breed: args.pure_breed,
            animal_name: args.animal_name,
            description: args.description,
            farmer_id: args.farmer_id
        })
        const valid = await newAnimal.save()
        if(error) return error
        return newAnimal
    }

module.exports = {
    createAnimal,
    signup,
    login,
}