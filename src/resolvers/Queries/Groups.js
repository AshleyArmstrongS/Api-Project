const Group = require("../../models/group");
const { getUserId } = require("../utils");
const {
  FAILED_AUTHENTICATION,
  OPERATION_SUCCESSFUL,
  OPERATION_FAILED,
} = require("./ResolverErrorMessages");
async function group(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    const group = await Group.findOne({ _id: args._id, user_id: user_id });
    if (!group) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, group: group };
    }
  }
  return returnable;
}
async function groups(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    const groups = await Group.find({ user_id: user_id });
    if (!groups) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, groups: groups };
    }
  }
  return returnable;
}
async function groupByName(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    const groups = await Group.find({
      group_name: args.group_name,
      user_id: user_id,
    });
    if (!groups) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, groups: groups };
    }
  }
  return returnable;
}
module.exports = {
  group,
  groups,
  groupByName,
};
