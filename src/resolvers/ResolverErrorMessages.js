const FAILED_AUTHENTICATION = {
  success: false,
  message: "Authentication Failed.",
};
const OPERATION_SUCCESSFUL = {
  success: true,
  message: "Operation Successful.",
};
const ALREADY_EXISTS = {
  success: false,
  message: "Object already exists.",
};
const OPERATION_FAILED = { success: false, message: "Operation Failed." };
const NO_SUCH_EMAIL = { success: false, message: "Email doesn't Exist." };
const INCORRECT_PASSWORD = { success: false, message: "Password Incorrect." };
const PASSWORD_RESET_FAILED = { success: false, message: "Password not reset." };
const INCORRECT_MOTHER = { success: false, message: "Dam cannot be of sex male." };
const INCORRECT_SIRE = { success: false, message: "Sire cannot be of sex female." };
const INCORRECT_PARENTS = { success: false, message: "Dam cannot be of sex male. Sire cannot be of sex female." };

module.exports = {
  FAILED_AUTHENTICATION,
  OPERATION_SUCCESSFUL,
  OPERATION_FAILED,
  ALREADY_EXISTS,
  NO_SUCH_EMAIL,
  INCORRECT_PASSWORD,
  PASSWORD_RESET_FAILED,
  INCORRECT_MOTHER,
  INCORRECT_SIRE,
  INCORRECT_PARENTS
};
