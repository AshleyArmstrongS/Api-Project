const jwt = require("jsonwebtoken");
const { APP_SECRET } = require("./DevConfig");
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
  getUserId,
};
