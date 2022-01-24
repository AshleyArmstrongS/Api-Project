const User = require("../../models/user");
const { getUserId } = require("../utils");
const {
  FAILED_AUTHENTICATION,
  OPERATION_SUCCESSFUL,
  OPERATION_FAILED,
} = require("./ResolverErrorMessages");
//API info
function info() {
  return "This is the OptiFarm API";
}
//User
async function user(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    const user = await User.findById(user_id);
    if (!user) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, user: user };
    }
  }
  return returnable;
}
module.exports = {
  info,
  user,
};
