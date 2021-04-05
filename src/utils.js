const jwt = require("jsonwebtoken");
const { APP_SECRET } = require("./Config");
function getUserId(context) {
  const Authorization = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZmJkNWE2NGJjOTM3MDA0ZjRhZDIxZDIiLCJpYXQiOjE2MTU4Mzc4NTF9.Xs_3dzxP6nwzReyaeBRbjQqOxWtykfuWgMxoMzQdylA"//context.request.get("Authorization");
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
