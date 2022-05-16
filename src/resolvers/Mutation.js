//User
const {signUp, login, updateUser, passwordResetAndLogin, } = require("./Mutations/User");
//Animals
const {createAnimal, updateAnimal, deleteAnimal,} = require("./Mutations/Animals");
// Groups
const {saveGroup, deleteGroup, addAnimalToGroup, removeAnimalFromGroup} = require("./Mutations/Groups")
//Medication
const {saveMedication,} = require("./Mutations/Medication")
//MedicationAdministration
const {saveAdminMed, deleteAdministeredMedication, deleteMedAdministrator,} = require("./Mutations/AdminMed")

module.exports = {
  signUp,
  login,
  passwordResetAndLogin,
  updateUser,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  saveGroup,
  addAnimalToGroup,
  removeAnimalFromGroup,
  deleteGroup,
  saveMedication,
  saveAdminMed,
  deleteAdministeredMedication,
  deleteMedAdministrator,
};
