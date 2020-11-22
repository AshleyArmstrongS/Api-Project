var Animal = require("../models/animals");

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
    const error = await newAnimal.save()

    if(error) return error
    return newAnimal
}

module.exports = {
    createAnimal
}