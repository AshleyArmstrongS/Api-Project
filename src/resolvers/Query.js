var Animal = require("../models/animals");

function info(){
    return "Hi this is the OptiFarm API."
}
function animal(){
   return Animal.find({})
}

module.exports = {
    info,
    animal,
}