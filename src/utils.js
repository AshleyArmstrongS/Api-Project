const jwt = require("jsonwebtoken");
const { APP_SECRET } = require("./Config");
function getUserId(context) {
  const Authorization = context.request.get("Authorization");
  if (Authorization) {
    const token = Authorization.replace("Bearer ", "");
    try {
      const { userId } = jwt.verify(token, APP_SECRET);
      return userId;
    } catch {
      return false
    }
  }
}

function errorConstructor(RESOLVER_ERROR, schema_error) {
  const message =
    RESOLVER_ERROR.message +
    schema_error.toString().replace("ValidationError: ", " ");
  return { success: RESOLVER_ERROR.success, message: message };
}

module.exports = {
  getUserId,
  errorConstructor,
};
