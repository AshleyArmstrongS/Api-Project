function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

//https://stackoverflow.com/questions/4975644/regular-expression-to-match-exactly-5-digits
const validateFiveDigitNumber = tag_number => {
  const re = /\b\d{5}\b/g
  return re.test(tag_number)
}
const validateHerdNumber = herd_number => {
  // if(herd_number.includes("IE")) {
  //   const re = /^[a-zA-Z0-9 ]{10}$/
  //   return re.test(herd_number)
  // } else {
  //   const re = /^[a-zA-Z0-9 ]{11}$/
  //   return re.test(herd_number)
  // }
  herd_number = capitalizeFirstLetter(herd_number)
  const re = /^[a-zA-Z][0-9]{7}$/
  return re.test(herd_number)
}
const validateAnimalName = animal_name => {
  const re = /^[a-zA-Z0-9_]+( [a-zA-Z0-9_]+)*$/
  return re.test(animal_name)
}
const validateBreedName = name => {
  const re = /^[a-zA-Z ]{2,30}$/
  return re.test(name)
}
const validateBreedCode = breed_code => {
  const re = /^[a-zA-Z0-9]{2,4}$/
  return re.test(breed_code)
}
const validateIsName = name => {
  const re = /^[a-zA-Z ]{2,30}$/
  return re.test(name)
}
// https://stackoverflow.com/questions/18022365/mongoose-validate-email-syntax
var validateEmail = function (email) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};
const validateGroupName = (name) => {
  const re = /^[a-zA-Z ]{2,30}$/;
  return re.test(name);
};
const validateIsNumber = (number) => {
  // regex from https://stackoverflow.com/questions/4246077/matching-numbers-with-regular-expressions-only-digits-and-commas/4247184#4247184
  const re = /^-?\d{1,20}(,\d{3})*(\.\d\d)?$|^\.\d\d$/;
  return re.test(number);
};
const validateIsString = (str) => {
  const re = /^([a-zA-Z0-9_ ]*)$/;
  return re.test(str);
};

module.exports = {
  validateFiveDigitNumber,
  validateHerdNumber,
  validateAnimalName,
  validateBreedName,
  validateBreedCode,
  validateIsName,
  validateEmail,
  validateGroupName,
  validateIsNumber,
  validateIsString,
};
