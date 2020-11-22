var Animal = require("../models/animals");

function info(){
    return "Hi this is the OptiFarm API."
}
function animal(parent, args){
    console.log(args)
    const id = args.id
   return Animal.findById(id)
}
function herd(){
    return Animal.find({});
}

module.exports = {
    info,
    animal,
    herd
}