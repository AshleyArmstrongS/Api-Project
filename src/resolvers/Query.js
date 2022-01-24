//User
const { info, user } = require("./Queries/User");
//Animal
const {
  animal,
  animalWithLastMedication,
  animalByTag,
  herd,
  herdCount,
  animalBySex,
  animalByProgeny,
  animalInAnyGroup,
  animalsInGroup,
  animalsInGroupCount,
} = require("./Queries/Animals");
//Group
const { group, groups, groupByName } = require("./Queries/Groups");
//Medication
const {
  medication,
  medications,
  medicationsOld,
  medicationsSortAndLimitTo4,
  medicationsByType,
  medicationsByRemainingQtyLessThan,
  medicationsByRemainingQtyGreaterThan,
  medicationsExpired,
  medicationsByName,
  medicationsLastThreeUsed,
} = require("./Queries/Medication");
// Medical_Administration
const {
  administeredMedication,
  administeredMedicationsActiveWithdrawalByMedication,
  administeredMedicationsActiveWithdrawalByAnimal,
  administeredMedications,
  administeredMedicationOnDate,
  administeredMedicationsByAnimal,
} = require("./Queries/AdminMed");
module.exports = {
  info,
  user,
  // Animal
  animal,
  animalWithLastMedication,
  animalByTag,
  herd,
  herdCount,
  animalBySex,
  animalByProgeny,
  animalInAnyGroup,
  animalsInGroup,
  animalsInGroupCount,
  // Group
  group,
  groups,
  groupByName,
  // Medication
  medication,
  medications,
  medicationsOld,
  medicationsSortAndLimitTo4,
  medicationsByType,
  medicationsByRemainingQtyLessThan,
  medicationsByRemainingQtyGreaterThan,
  medicationsExpired,
  medicationsByName,
  medicationsLastThreeUsed,
  // AdministeredMedication
  administeredMedication,
  administeredMedicationsActiveWithdrawalByMedication,
  administeredMedicationsActiveWithdrawalByAnimal,
  administeredMedications,
  administeredMedicationOnDate,
  administeredMedicationsByAnimal,
};
