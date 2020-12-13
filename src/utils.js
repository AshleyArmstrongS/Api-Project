const jwt = require("jsonwebtoken");
const {APP_SECRET} = require("./Config");
const FAILED_AUTHENTICATION = {
  code: 400,
  success: false,
  message: "Authentication Failed",
};
function getUserId(context) {
  const Authorization = context.request.get("Authorization");
  if (Authorization) {
    const token = Authorization.replace("Bearer ", "");
    try {
      const { userId } = jwt.verify(token, APP_SECRET);
      return userId;
    } catch {
      return false;
    }
  }

  throw new Error("Not authenticated");
}

module.exports = {
  FAILED_AUTHENTICATION,
  getUserId,
};
