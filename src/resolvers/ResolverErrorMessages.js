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
module.exports = {
  FAILED_AUTHENTICATION,
  OPERATION_SUCCESSFUL,
  OPERATION_FAILED,
  ALREADY_EXISTS,
  NO_SUCH_EMAIL,
  INCORRECT_PASSWORD,
};
