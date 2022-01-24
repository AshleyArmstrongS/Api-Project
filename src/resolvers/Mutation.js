//Login/SignUp
const {signUp, login, updateUser, passwordResetAndLogin, } = require("./Mutations/User");
//Animal Mutations
const {deleteAnimal, saveAnimal,} = require("./Mutations/Animals");
// Group Mutations
const {saveGroup, deleteGroup, addAnimalToGroup, removeAnimalFromGroup} = require("./Mutations/Groups")
//Medication Mutations
const {saveMedication,} = require("./Mutations/Medication")
//MedicationAdministration Mutations
const {saveAdminMed, deleteAdministeredMedication, deleteMedAdministrator,} = require("./Mutations/AdminMed")

module.exports = {
  signUp,
  login,
  passwordResetAndLogin,
  updateUser,
  saveAnimal,
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
