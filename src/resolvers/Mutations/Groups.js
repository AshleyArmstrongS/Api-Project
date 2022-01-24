const { getUserId, errorConstructor } = require("../../utils");
const Group = require("../../models/group");
const Animal = require("../../models/animals");
const {
    FAILED_AUTHENTICATION,
    OPERATION_SUCCESSFUL,
    ALREADY_EXISTS,
    OPERATION_FAILED,
  } = require("../ResolverErrorMessages");
async function saveGroup(parent, args, context) {
    try {
      const user_id = getUserId(context);
      var returnable = { responseCheck: FAILED_AUTHENTICATION };
      if (user_id) {
        if (args._id) {
          returnable = updateGroup(args, user_id);
        } else {
          returnable = createGroup(args, user_id);
        }
      }
      return returnable;
    } catch (err) {
      return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
    }
  }
  async function createGroup(args, user_id) {
    try {
      const alreadyExists = await Group.findOne({
        group_name: args.group_name,
        user_id: user_id,
      });
      if (!alreadyExists) {
        const newGroup = new Group({
          group_name: args.group_name,
          group_description: args.group_description ?? null,
          user_id: user_id,
          group_size: 0,
        });
        const valid = await newGroup.save();
        if (!valid) {
          return { responseCheck: OPERATION_FAILED };
        }
        return {
          responseCheck: OPERATION_SUCCESSFUL,
          group: newGroup,
        };
      }
      return { responseCheck: ALREADY_EXISTS };
    } catch (err) {
      return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
    }
  }
  async function updateGroup(args) {
    try {
      const groupToUpdate = await Group.findById(args._id);
      const valid = await Group.findByIdAndUpdate(
        { _id: args._id },
        {
          group_name: args.group_name ?? groupToUpdate.group_name,
          group_description:
            args.group_description ?? groupToUpdate.description ?? null,
        }
      );
      if (!valid) {
        return { responseCheck: OPERATION_FAILED };
      }
      const editedGroup = Group.findOne({ _id: args._id });
      return {
        responseCheck: OPERATION_SUCCESSFUL,
        group: editedGroup,
      };
    } catch (err) {
      return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
    }
  }
  async function addAnimalToGroup(parent, args, context) {
    try {
      const id = getUserId(context);
      if (!id) {
        return { responseCheck: FAILED_AUTHENTICATION };
      }
      const groupPresent = await Animal.findOne({
        _id: args._id,
        groups_id: args.groups_id,
      });
      if (!groupPresent) {
        const valid = await Animal.findByIdAndUpdate(
          { _id: args._id },
          { $push: { groups_id: args.groups_id } }
        );
        if (!valid) {
          return { responseCheck: OPERATION_FAILED };
        }
        await Group.findByIdAndUpdate(
          { _id: args.groups_id },
          { $inc: { group_size: +1 } }
        );
        const editedAnimal = Animal.findOne({ _id: args._id });
        return {
          responseCheck: OPERATION_SUCCESSFUL,
          animal: editedAnimal,
        };
      } else {
        return { responseCheck: ALREADY_EXISTS };
      }
    } catch (err) {
      return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
    }
  }
  async function removeAnimalFromGroup(parent, args, context) {
    try {
      const id = getUserId(context);
      if (!id) {
        return FAILED_AUTHENTICATION;
      }
      const valid = await Animal.findByIdAndUpdate(
        { _id: args._id },
        { $pull: { groups_id: args.groups_id } }
      );
      if (!valid) {
        return { responseCheck: OPERATION_FAILED };
      }
      await Group.findByIdAndUpdate(
        { _id: args.groups_id },
        { $inc: { group_size: -1 } }
      );
      const editedAnimal = Animal.findOne({ _id: args._id });
      return {
        responseCheck: OPERATION_SUCCESSFUL,
        animal: editedAnimal,
      };
    } catch (err) {
      return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
    }
  }
  async function deleteGroup(parent, args, context) {
    try {
      const user_id = getUserId(context);
      if (!user_id) {
        return FAILED_AUTHENTICATION;
      }
      await Animal.updateMany(
        {
          groups_id: args._id,
          user_id: user_id,
        },
        { $pull: { groups_id: args._id } }
      );
      const deletedGroup = await Group.findByIdAndDelete(args._id);
      if (deletedGroup) {
        return {
          responseCheck: OPERATION_SUCCESSFUL,
          group: deletedGroup,
        };
      }
      return {
        responseCheck: OPERATION_FAILED,
      };
    } catch (err) {
      return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
    }
  }

  module.exports = {
    saveGroup,
    addAnimalToGroup,
    removeAnimalFromGroup,
    deleteGroup,
};